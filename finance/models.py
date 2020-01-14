from __future__ import unicode_literals

from django.db import models
from picklefield.fields import PickledObjectField


class Transaction(models.Model):
    date = models.DateField()
    title = models.CharField(max_length=100)
    account = models.CharField(max_length=100, null=True, blank=True)
    amount = models.IntegerField()
    deleted = models.BooleanField(default=False)
    moved = models.BooleanField(default=False)
    owner = models.ForeignKey('auth.User', related_name='transactions', on_delete=models.CASCADE, null=True)

    def __unicode__(self):
        if self.account:
            return " - ".join([self.date.strftime("%Y-%m-%d"), self.title, self.account])
        return " - ".join([self.date.strftime("%Y-%m-%d"), self.title])


class Category(models.Model):
    title = models.CharField(max_length=100)
    expense = models.BooleanField(default=True)
    budget = models.IntegerField(blank=True, null=True)
    transactions = models.ManyToManyField(Transaction, blank=True)
    owner = models.ForeignKey('auth.User', related_name='categories', on_delete=models.CASCADE, null=True)
    sync_in_progress = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Categories'

    def __unicode__(self):
        return self.title

    @property
    def chart_data(self):
        query_result = [t for t in Transaction.objects.raw("""
            SELECT 1 as id, ABS(SUM(amount)) as amount, MAX(CONCAT(YEAR(date), '-', LPAD(MONTH(date), 2, 0))) as date
            FROM finance_transaction
            WHERE owner_id={} AND deleted=0 AND id in (SELECT transaction_id FROM finance_category_transactions WHERE category_id={}) AND date > DATE_SUB(now(), INTERVAL 5 MONTH)
            GROUP BY YEAR(date), MONTH(date)
        """.format(self.owner.pk, self.id))]
        return {
            "pk": self.pk,
            "labels": [x.date for x in query_result],
            "datasets": [{
                "label": "",
                "data": [int(x.amount) for x in query_result],
                "borderColor": "#858796",
                "fill": False
            }]
        }

    def get_budget_summary(self, year, month):
        transactions = self.transactions.filter(owner=self.owner, deleted=False, date__month=month, date__year=year)
        current_amount = abs(sum([transaction.amount for transaction in transactions]))
        percentual_amount = int(float(current_amount) / float(self.budget) * 100)

        if percentual_amount >= 100:
            color = 'danger'
        elif percentual_amount > 75:
            color = 'warning'
        else:
            color = 'success'

        if self.budget != 0:
            return {
                'absolute': current_amount,
                'percentage': percentual_amount,
                'color': color,
                'category': self.title,
                'budget': self.budget,
                'pk': self.pk
            }
        else:
            return {
                'total_amount': 0,
                'percentual_amount': 0
            }

    @classmethod
    def budget_summaries(cls, user, year, month, sync_in_progress):
        categories = user.categories.exclude(budget__isnull=True).exclude(budget=0)
        budget_summaries = []

        for category in categories:
            if sync_in_progress:
                budget_summaries.append({
                    'absolute': 0,
                    'percentage': 0,
                    'color': None,
                    'category': category.title,
                    'budget': category.budget,
                    'pk': category.pk
                })
            else:
                budget_summary = category.get_budget_summary(year, month)
                budget_summaries.append(budget_summary)
        return budget_summaries


class CategoryKeyword(models.Model):
    keyword = models.CharField(max_length=50)
    category = models.ForeignKey(Category, related_name='keywords')
    owner = models.ForeignKey('auth.User', related_name='category_keywords', on_delete=models.CASCADE, null=True)

    def __unicode__(self):
        return self.keyword


class TransactionClassifier(models.Model):
    date = models.DateField(auto_now=True)
    accuracy = models.IntegerField()
    text_clf = PickledObjectField()
    label_encoder = PickledObjectField()


