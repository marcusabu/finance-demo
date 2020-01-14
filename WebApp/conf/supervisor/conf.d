[program:celeryd]
command=/usr/local/bin/celery -A WebApp worker -l info
directory=/var/www/WebApp/
numprocs=1
stdout_logfile=/var/www/WebApp/celery-worker.log
stderr_logfile=/var/www/WebApp/celery-beat.log
autostart=true
autorestart=true
startsecs=10

[program:celerybeat]
command=/usr/local/bin/celery -A WebApp beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
directory=/var/www/WebApp/
numprocs=1
stdout_logfile=/var/www/WebApp/celery-beat.log
stderr_logfile=/var/www/WebApp/celery-beat.log
autostart=true
autorestart=true
startsecs=10

[program:flower]
command=/usr/local/bin/flower -A WebApp --port=8001
directory=/var/www/WebApp/
numprocs=1
stdout_logfile=/var/www/WebApp/flower.log
stderr_logfile=/var/www/WebApp/flower.log
autostart=true
autorestart=true
startsecs=10