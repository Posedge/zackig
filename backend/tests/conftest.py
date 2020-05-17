import os

import pytest


@pytest.fixture(scope="session")
def client():
    # configure in testing environment
    os.environ['ZKG_TESTING'] = 'true'
    os.environ['ZKG_DISABLE_CSRF_CHECK'] = 'true'
    os.environ['ZKG_MONGODB_COLLECTION'] = 'zackig_testing'
    from app import app, db
    db['users'].drop()
    db['notes'].drop()

    with app.test_client() as test_client:
        yield test_client


@pytest.fixture(scope="module")
def logged_in_client(client):
    credentials = {'username': 'b', 'password': 'b'}
    assert client.post('/v0/register', json=credentials).status_code == 200
    assert client.post('/v0/login', json=credentials).status_code == 200
    yield client
    assert client.post('/v0/logout').status_code == 200
