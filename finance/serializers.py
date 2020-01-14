from rest_framework import serializers
from models import *


class CategoryKeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryKeyword
        fields = "__all__"


class CategoryDetailSerializer(serializers.ModelSerializer):
    keywords = CategoryKeywordSerializer(many=True)

    class Meta:
        model = Category
        fields = ('pk', 'title', 'expense', 'budget', 'sync_in_progress', 'chart_data', 'keywords')


class CategorySummarySerializer(serializers.ModelSerializer):
    chart_data = serializers.Field

    class Meta:
        model = Category
        fields = ('pk', 'title', 'summary_dataset')


class CategorySerializer(serializers.ModelSerializer):
    chart_data = serializers.Field

    class Meta:
        model = Category
        fields = ('pk', 'title', 'sync_in_progress')


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('pk', 'date', 'title', 'account', 'amount', 'deleted')
