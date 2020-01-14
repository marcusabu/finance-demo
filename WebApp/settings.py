from __future__ import absolute_import
import os
from celery.schedules import crontab
import environ

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
    DATABASE_PASSWORD=str,
    EMAIL_PASSWORD=str,
    SERVER_PASSWORD=str,
)
environ.Env.read_env(BASE_DIR + "/.env")

SECRET_KEY = 'c*aj@cvplapghi#nu1m%px^g@b^0f1vziio(@3k+i%*5_#swaj'

DEBUG = env("DJANGO_DEBUG")

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_celery_beat',
    'django_celery_results',
    'django_slack',
    'rest_framework',
    'corsheaders',
    # 'marcusabukari',
    'finance',
    'rest_framework.authtoken'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'WebApp.urls'

WSGI_APPLICATION = 'WebApp.wsgi.application'

CORS_ORIGIN_ALLOW_ALL = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages'
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'webapp',
        'USER': 'root',
        'PASSWORD': env("DATABASE_PASSWORD"),
        'HOST': 'marcusabukari.nl',
        'PORT': '3306',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

LANGUAGE_CODE = 'nl'
TIME_ZONE = 'Europe/Amsterdam'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

MODEL_ROOT = os.path.join(BASE_DIR, 'models/')

ENDLESS_PAGINATION_PER_PAGE = 36

ADMINS = [('Marcus', 'marcusabu@gmail.com')]

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'marcusabu.django@gmail.com'
EMAIL_HOST_PASSWORD = env("EMAIL_PASSWORD")
EMAIL_PORT = 587
EMAIL_USE_TLS = True

SLACK_BACKEND = "django_slack.backends.UrllibBackend"
SLACK_TOKEN = "xoxb-290688411568-tlBjiokatyLHElRepNlcXWeW"
SLACK_CHANNEL = "#server_errors"

CELERY_BROKER_URL = 'redis://localhost:6379'
CELERY_RESULT_BACKEND = 'redis://localhost:6379'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Europe/London'
CELERYBEAT_SCHEDULE = {
    'settings_task': {
        'task': 'marcusabukari.tasks.debug_task',
        'schedule': crontab()
    },
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    )
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(asctime)s - %(levelname)s - %(module)s - %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': True,
        },
        'slack_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django_slack.log.SlackExceptionHandler',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins', 'slack_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        # 'celery': {
        #     'level': 'WARNING',
        #     'handlers': ['console', 'mail_admins', 'slack_admins'],
        #     'propagate': False,
        # },
        'marcusabukari.management': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False
        },
    },
}

