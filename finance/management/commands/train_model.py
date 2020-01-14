from django.core.management.base import BaseCommand
from finance.tasks import *


class Command(BaseCommand):
    help = "Train model"
    command = "train_model"

    def handle(self, *args, **options):
        print "TRAINING MODEL"
        train_model.delay()


