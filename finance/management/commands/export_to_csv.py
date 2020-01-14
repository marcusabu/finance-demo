from django.core.management.base import BaseCommand
from finance.models import *
import csv


class Command(BaseCommand):
    help = "Export transactions to CSV"
    command = "export_to_csv"

    def handle(self, *args, **options):
        with open('transactions_export.csv', 'w') as file:
            writer = csv.writer(file, delimiter=';')
            for transaction in Transaction.objects.filter(owner_id=1):
                if transaction.category_set.exists():
                    writer.writerow([transaction.title, transaction.category_set.first()])
