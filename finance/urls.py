from views import *
from rest_framework.routers import DefaultRouter
from django.conf.urls import url

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'keywords', CategoryKeywordViewset, basename='keywords')
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = router.urls

urlpatterns += [
    url(r'metadata', MetaDataView.as_view())
]
