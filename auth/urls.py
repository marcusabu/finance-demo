from rest_framework.authtoken import views
from django.conf.urls import include, url

urlpatterns = [
    url(r'^token-auth', views.obtain_auth_token)
]