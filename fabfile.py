from fabric.api import *
import datetime
import environ

envv = environ.Env(
    DJANGO_DEBUG=(bool, False),
    DATABASE_PASSWORD=str,
    EMAIL_PASSWORD=str,
    SERVER_PASSWORD=str,
)
environ.Env.read_env()


def prod():
    env.user = 'root'
    env.hosts = ['marcusabukari.nl']
    env.password = envv("SERVER_PASSWORD")


def setup():
    run('mkdir -p /var/www/WebApp')

    # Installing packages
    run('sudo apt-get update')
    run('sudo apt-get install -y python-pip apache2 libapache2-mod-wsgi')

    # Installing mysql
    run('sudo apt-get install -y mysql-server python-django python-mysqldb')
    run('cp /etc/mysql/my.cnf /etc/mysql/my.cnf.backup')
    run("sed -i 's/bind\-address.*/#bind\-address = 0\.0\.0\.0/g' /etc/mysql/my.cnf")
    run('mysql -u root -p{} -e "exit"'.format(envv("DATABASE_PASSWORD")))
    run('mysql -u root -p{} -e "CREATE USER \'root\'@\'%\' IDENTIFIED BY \'{}\'"'.format(envv("DATABASE_PASSWORD"),
                                                                                              envv("DATABASE_PASSWORD")))
    run('mysql -u root -p{} -e "GRANT ALL PRIVILEGES ON *.* TO \'root\'@\'%\' IDENTIFIED BY \'{}\' WITH GRANT OPTION"'
        .format(envv("DATABASE_PASSWORD"), envv("DATABASE_PASSWORD")))
    run('mysql -u root -p{} -e "CREATE DATABASE webapp"'.format(envv("DATABASE_PASSWORD")))
    run('systemctl restart mysql.service')

    # Installing redis
    run('sudo apt-get install -y redis-server')
    run('sudo systemctl enable redis-server.service')
    apache_conf = open('WebApp/conf/apache.xml', mode='r').read()
    run('touch /etc/apache2/sites-available/webapp.conf && echo "{}" > /etc/apache2/sites-available/webapp.conf'.format(apache_conf))
    run('sudo service apache2 restart')

    # Installing supervisor
    run('sudo apt-get install -y supervisor')
    run('sudo service apache2 reload')
    run('sudo supervisorctl reread')
    run('sudo supervisorctl update')
    run('sudo supervisorctl restart all')
    supervisor_conf = open('WebApp/conf/supervisor/conf.d', mode='r').read()

    # Configure apache
    run('touch /etc/supervisor/conf.d/WebApp.conf && echo "{}" > /etc/supervisor/conf.d/WebApp.conf'.format(supervisor_conf))

    # Adding SSL
    run('sudo apt-get install -y software-properties-common')
    run('sudo add-apt-repository universe')
    run('sudo add-apt-repository ppa:certbot/certbot')
    run('sudo apt-get update')
    run('sudo apt-get install certbot python-certbot-apache')
    run('sudo certbot --apache')
    run('sudo certbot renew --dry-run')

    # Opening ports
    run('sudo ufw allow 80')
    run('sudo ufw allow 443')
    run('sudo ufw allow 8001')
    run('sudo ufw allow 8080')

    # Install project
    with cd('/var/www/WebApp'):
        run('git clone git@gitlab.com:marcusabu/WebApp.git .')
        # run('git pull origin master')
        run('sudo pip install -r requirements.txt')
        env_file = open('.env', mode='r').read()
        run('touch .env && echo "{}" > .env'.format(env_file))
        run('python manage.py migrate')
        run('python manage.py collectstatic --noinput')
        run('a2dissite 000-default')
        run('a2ensite webapp')
        run('sudo service apache2 reload')
    print "====\nAdd WSGIPassAuthorization manually!"


def deploy():
    with cd('/var/www/WebApp'):
        run('git reset --hard')
        run('git pull origin master')
        run('sudo pip install -r requirements.txt')
        run('python manage.py migrate')
        run('python manage.py collectstatic --noinput')
        run('sudo service apache2 reload')
        run('sudo supervisorctl reread')
        run('sudo supervisorctl update')
        run('sudo supervisorctl restart all')


def database_backup():
    date = datetime.date.today().strftime("%Y-%m-%d")
    with cd('/var/www/WebApp'):
        run("mysqldump -u root -p{} website > Backups/database/{}-dump.sql".format(env("DATABASE_PASSWORD"), date))
        run("git add Backups/database")
        run("git commit -m 'Database backup {}'".format(date))
        run("git push origin master")

