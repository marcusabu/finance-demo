from django.core.management.base import BaseCommand
from finance.models import *
import csv
from django.contrib.auth.models import User
import random
from finance.tasks import *

choices = "Aldi, Albert Heijn, Dirk, Jumbo, Hoogvliet, Lidl, Thuisbezorgd, Smullers, Pizza, Benzine, OV-chipkaart, Uber, ING, Rabobank, ABN-AMRO, Zalando, Asos, Wehkamp, Spotify, Netflix, Apple music, Google drive, Auto verzekering, Inboedel verzekerking"


class Command(BaseCommand):
    help = "Generated data for demo user"
    command = "generate_demo_data"

    def handle(self, *args, **options):
        marcusabu = User.objects.get(username='marcusabu')
        demo = User.objects.get(username='demo')

        Transaction.objects.filter(owner=demo).delete()

        for transaction in Transaction.objects.filter(owner=marcusabu, date__year='2019'):
            if 0 > transaction.amount > -100:
                transaction.owner = demo
                transaction.title = random.choice(choices.split(", "))
                transaction.pk = None
                transaction.save()
                transaction.category_set.clear()

        for category in Category.objects.filter(owner=demo):
            sync_transactions.delay(category.pk)