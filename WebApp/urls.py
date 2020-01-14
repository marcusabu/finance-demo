from django.conf.urls import include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    # url(r'^', include('marcusabukari.urls', namespace='marcusabukari')),
    url(r'^', include(admin.site.urls), name='admin'),
    url(r'^auth/', include('auth.urls')),
    url(r'^finance/', include('finance.urls')),
]
