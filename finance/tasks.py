from __future__ import absolute_import, unicode_literals
from celery import shared_task
from django.db import IntegrityError
from sklearn import metrics, preprocessing
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import pickle
import warnings
from sklearn import svm
import pandas as pd
import re
from .models import *
from django.conf import settings
from django.contrib.auth.models import User

warnings.filterwarnings('ignore')


def cleaned_text(text):
    return filter(str.isalnum, str(text)).lower()


def preprocess_text(text):
    # Remove punctuations and numbers
    text = re.sub('[^a-zA-Z]', ' ', text)

    # Single character removal
    text = re.sub(r'\b\w{1,1}\b', ' ', text)

    # Removing multiple spaces
    text = re.sub(r'\s+', ' ', text)

    return text.lower()


@shared_task()
def train_model():
    print "==== TRAIN MODEL ===="
    print "Querying data"
    transactions = list()
    transactionQuery = Transaction.objects.filter(owner_id=1)
    for query in transactionQuery:
        categories = query.category_set.all()
        if len(categories) == 1:
            transactions.append([query.title, categories.first().title])

    print "Preparing dataframe"
    df = pd.DataFrame(transactions, columns=['Text', 'Category'])
    df['Text'] = df['Text'].apply(preprocess_text)
    X = df['Text']
    label_encoder = preprocessing.LabelEncoder()
    y = label_encoder.fit_transform(df['Category'].tolist())

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=3)

    text_clf = Pipeline([('vect', CountVectorizer()),
                         ('tfidf', TfidfTransformer()),
                         ('clf', svm.LinearSVC()),
                         ])

    print "Training model"
    text_clf.fit(X_train, y_train)

    print "Predicting test data"
    svm_predictions = text_clf.predict(X_test)

    print "\n===========\n"
    print "Accuracy score"
    accuracy = metrics.accuracy_score(y_test, svm_predictions) * 100
    print(accuracy)

    transaction_classifier = TransactionClassifier()
    transaction_classifier.accuracy = accuracy
    transaction_classifier.text_clf = text_clf
    transaction_classifier.label_encoder = label_encoder
    transaction_classifier.save()
    return True


@shared_task()
def sync_transactions(category_ids=None):
    full_sync = False
    if isinstance(category_ids, list):
        categories = Category.objects.filter(pk__in=category_ids)
    elif isinstance(category_ids, str):
        categories = Category.objects.filter(pk=int(category_ids))
    elif isinstance(category_ids, int):
        categories = Category.objects.filter(pk=category_ids)
    else:
        categories = Category.objects.all()
        full_sync = True

    if categories.exists():
        for category in categories:
            category.transactions.clear()
        category.sync_in_progress = True
        category.save()

        for user in User.objects.all():
            for transaction in Transaction.objects.filter(owner=user):
                transaction_title = cleaned_text(transaction.title)
                for category in categories.filter(owner=user):
                    for keyword in category.keywords.all():
                        keyword_text = cleaned_text(keyword)
                        if keyword_text in transaction_title:
                            try:
                                category.transactions.add(transaction)
                                break
                            except IntegrityError:
                                pass

        for category in categories:
            category.sync_in_progress = False
            category.save()
        return True
    return False
