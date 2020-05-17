FROM python:3.7-alpine as dev

WORKDIR /opt/app

RUN pip install pipenv
ENV FLASK_ENV=development

CMD echo 'installing dependencies...' && pipenv install --dev \
 && echo 'starting development server...' && pipenv run flask run --host=0.0.0.0 --debugger


FROM python:3.7-alpine as runner

WORKDIR /opt/app

# bug workaround https://github.com/pypa/pipenv/issues/4174
ENV PIPENV_VENV_IN_PROJECT 1

RUN pip install pipenv

COPY Pipfile Pipfile.lock /opt/app/
RUN pipenv sync
COPY ./ /opt/app/
ENV ZKG_SECRETS='<your secret here>'
ENV ZKG_MONGODB='<your db here>'

# use /dev/shm in-memory filesystem for heartbeat file
CMD pipenv run gunicorn app:app --bind 0.0.0.0:8080 --workers=4 --worker-tmp-dir /dev/shm
