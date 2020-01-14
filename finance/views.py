from serializers import *
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from tasks import *
from datetime import datetime
from WebApp.celery import app


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return user.categories.all()

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'update':
            return CategoryDetailSerializer
        else:
            return CategorySerializer

    def create(self, request, *args, **kwargs):
        user = request.user

        try:
            title = request.data['title']
        except:
            return Response("Title is required", status=500)
        try:
            keywords = request.data['keywords']
        except:
            return Response("Keywords are required", status=500)

        try:
            budget = int(request.data[u'budget'])
        except:
            budget = 0

        category = Category()
        category.title = title
        category.expense = True
        category.budget = budget
        category.owner = user
        category.sync_in_progress = True
        category.save()
        for keyword in keywords:
            categoryKeyword = CategoryKeyword()
            categoryKeyword.keyword = keyword['keyword']
            categoryKeyword.category = category
            categoryKeyword.owner = user
            categoryKeyword.save()

        sync_transactions.delay(category.pk)
        return Response(self.get_serializer_class()(category).data)

    def update(self, request, pk=None):
        keyword_change = False
        user = request.user

        try:
            title = request.data['title']
        except:
            return Response("Title is required", status=500)
        try:
            keywords = request.data['keywords']
        except:
            return Response("Keywords are required", status=500)

        category = user.categories.get(pk=pk)
        category.title = title
        category.budget = int(request.data[u'budget']) if 'budget' in request.data else None
        category.owner = user

        for keyword in keywords:
            id = int(keyword['id']) if 'id' in keyword else None

            categoryKeyword, created = category.keywords.get_or_create(
                pk=id,
                owner=user,
                category=category)

            if 'deleted' in keyword and keyword['deleted']:
                categoryKeyword.delete()
                keyword_change = True
            else:
                keyword_change = categoryKeyword.keyword != keyword['keyword']
                categoryKeyword.keyword = keyword['keyword'].lower()
                categoryKeyword.save()

            if created:
                keyword_change = created

        category.save()
        if keyword_change:
            sync_transactions.delay(category.pk)

        serializer = self.get_serializer_class()
        return Response(serializer(category).data)

    @action(detail=True, methods=['post', 'get'])
    def transactions(self, request, pk):
        user = request.user
        today = datetime.today()

        year = request.GET[u'year'] if 'year' in request.GET else today.year
        month = request.GET[u'month'] if 'month' in request.GET else today.month

        transactions = user.transactions.filter(owner=user, category__id=pk, date__year=year,
                                                date__month=month).order_by('-date')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        today = datetime.today()
        sync_in_progress = Category.objects.filter(sync_in_progress=True, budget__isnull=False).exists()

        year = request.GET[u'year'] if 'year' in request.GET else today.year
        month = request.GET[u'month'] if 'month' in request.GET else today.month
        budget_summaries = Category.budget_summaries(user, year, month, sync_in_progress)

        return Response({
                'last_date': user.transactions.order_by('date').last().date,
                'budget_summary': budget_summaries,
                'sync_in_progress': sync_in_progress
            })


class CategoryKeywordViewset(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return user.category_keywords.all()

    def get_serializer_class(self):
        return CategoryKeywordSerializer

    @action(detail=False, methods=['post'])
    def create_bulk(self, request):
        user = request.user
        keywords = request.data[u'keywords'] if 'keywords' in request.data else []
        category_sync_id_list = []

        for keyword in keywords:
            category_pk = keyword[u'category']
            keyword_input = keyword[u'keyword'].lower()
            category = Category.objects.get(pk=category_pk)

            if category.pk not in category_sync_id_list:
                category_sync_id_list.append(category_pk)

            if category:
                keyword = CategoryKeyword()
                keyword.keyword = keyword_input
                keyword.owner = user
                keyword.category = category
                keyword.save()

        sync_transactions.delay(category_sync_id_list)
        return Response("OK", 200)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(owner=user)

    @action(detail=False, methods=['get'])
    def remaining(self, request):
        today = datetime.today()

        year = request.GET[u'year'] if 'year' in request.GET else today.year
        month = request.GET[u'month'] if 'month' in request.GET else today.month

        transactions = self.get_queryset().filter(category__isnull=True).filter(date__year=year, date__month=month).order_by('-date')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload(self, request):

        def cleaned_text(text):
            return filter(str.isalnum, str(text)).lower()

        user = request.user
        transactions = []

        for line in request.data[u'contents'].split("\n")[1:-1]:
            data = line.replace("\"", "").split(",")
            date = datetime.strptime(data[0], "%Y%m%d").date()

            date = date
            title = data[1]
            account = data[3]

            try:
                amount = float(data[6])
            except:
                amount = 0
            if data[5] == "Af":
                amount = amount * -1
            amount = amount

            transaction, created = Transaction.objects.get_or_create(
                    date=date,
                    title=title,
                    account=account,
                    amount=amount,
                    owner=user)

            if created:
                transaction.date = date
                transaction.title = title
                transaction.account = account
                transaction.owner = user
                transaction.amount = amount
                transaction.save()

                for category in Category.objects.all():
                    for keyword in category.keywords.all():
                        if cleaned_text(keyword) in cleaned_text(transaction.title):
                            transaction.category_set.add(category)

            category = transaction.category_set.first()
            transactions.append({
                "title": transaction.title,
                "category": category.title if category else None,
                "created": created
            })
        return Response(transactions)

    # @action(detail=False, methods=['post'])
    # def upload(self, request):
    #
    #     def cleaned_text(text):
    #         return filter(str.isalnum, str(text)).lower()
    #
    #     user = request.user
    #     transactions = []
    #
    #     transaction_classifier = TransactionClassifier.objects.last()
    #
    #     for line in request.data[u'contents'].split("\n")[1:-1]:
    #         data = line.replace("\"", "").split(",")
    #         date = datetime.strptime(data[0], "%Y%m%d").date()
    #
    #         date = date
    #         title = data[1]
    #         account = data[3]
    #
    #         try:
    #             amount = float(data[6])
    #         except:
    #             amount = 0
    #         if data[5] == "Af":
    #             amount = amount * -1
    #         amount = amount
    #
    #         transaction, created = Transaction.objects.get_or_create(
    #                 date=date,
    #                 title=title,
    #                 account=account,
    #                 amount=amount,
    #                 owner=user)
    #
    #         if created:
    #             transaction.date = date
    #             transaction.title = title
    #             transaction.account = account
    #             transaction.owner = user
    #             transaction.amount = amount
    #             transaction.save()
    #
    #             text_clf = transaction_classifier.text_clf
    #             label_encoder = transaction_classifier.label_encoder
    #
    #             predictions = text_clf.predict([transaction.title])
    #             prediction_label = label_encoder.inverse_transform(predictions)[0]
    #
    #             for category in Category.objects.filter(title=prediction_label):
    #                 transaction.category_set.add(category)
    #
    #         category = transaction.category_set.first()
    #         transactions.append({
    #             "title": transaction.title,
    #             "category": category.title if category else None,
    #             "created": created
    #         })
    #     return Response(transactions)

    def destroy(self, request, pk=None):
        t = self.get_queryset().get(pk=pk)
        t.deleted = not t.deleted
        t.save()
        return Response("OK", 200)


class MetaDataView(APIView):

    def get(self, request, format=None):
        result = app.control.broadcast('ping', reply=True, limit=1)
        celery_online = len(result) > 0
        return Response({
            'celery_online': celery_online,
            'sync_in_progress': Category.objects.filter(sync_in_progress=True).exists()
        })

