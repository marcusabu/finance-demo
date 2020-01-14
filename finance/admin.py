from django.contrib import admin
from models import *
from tasks import *


def trigger_transactions_sync(modeladmin, request, queryset):
    sync_transactions.delay(None)


class TransactionAdmin(admin.ModelAdmin):
    ordering = ('-date',)
    list_display = ('date', 'amount', 'title', 'deleted', 'owner')
    list_display_links = ('date', 'title')
    search_fields = ('title',)


class CategoryKeywordInline(admin.TabularInline):
    model = CategoryKeyword


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'budget', 'number_of_transactions', 'owner')
    exclude = ['transactions']
    inlines = [CategoryKeywordInline]
    actions = [trigger_transactions_sync]

    def number_of_transactions(self, obj):
        return obj.transactions.all().count()


class CategoryKeywordAdmin(admin.ModelAdmin):
    list_display = ('keyword', 'category', 'owner')


class TransactionClassifierAdmin(admin.ModelAdmin):
    list_display = ('date', 'accuracy')


admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(TransactionClassifier, TransactionClassifierAdmin)
# admin.site.register(CategoryKeyword, CategoryKeywordAdmin)
