import os
import sys

from django.core.wsgi import get_wsgi_application

sys.path.append('/var/www/WebApp')
os.environ['DJANGO_SETTINGS_MODULE'] = 'WebApp.settings'

application = get_wsgi_application()
