from django.core.management.base import BaseCommand
from finance.tasks import *


class Command(BaseCommand):
    help = "Sync transactions"
    command = "sync_transactions"

    def add_arguments(self, parser):
        parser.add_argument('category', nargs='?', default=None)

    def handle(self, *args, **options):
        print "SYNCING TRANSACTIONS"
        sync_transactions.delay(options['category'])
