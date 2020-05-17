"""
Test all functionality related to authorization, e.g. logging in, logging out, registering etc.
"""


def test_nonexisting_account(client):
    response = client.get('/v0/whoami')
    assert response.status_code == 401

    response = client.post('/v0/login', json={
        'username': 'a',
        'password': 'a'
    })
    assert response.status_code == 401

    # can not see any content
    res = client.get('/v0/notes')
    assert res.status_code == 401
    assert 'notes' not in res.get_json()


def test_register(client):
    res = client.post('/v0/register', json={
        'username': 'a',
        'password': 'a'
    })
    assert res.status_code == 200

    # assert cannot register twice
    res = client.post('/v0/register', json={
        'username': 'a',
        'password': 'a'
    })
    assert res.status_code >= 400


def test_login(client):
    # can now log in
    res = client.post('/v0/login', json={
        'username': 'a',
        'password': 'a'
    })
    assert res.status_code == 200
    access_token, csrf_token = res.headers.get_all('Set-Cookie')
    assert 'HttpOnly' in access_token
    assert 'MaxAge' not in access_token

    # is now logged in
    res = client.get('/v0/whoami')
    assert res.status_code == 200
    assert res.get_json()['username'] == 'a'

    # can now see content
    res = client.get('/v0/notes')
    assert res.status_code == 200
    assert res.get_json()['notes'] is not None


def test_persistent_login(client):
    res = client.post('/v0/login', json={
        'username': 'a',
        'password': 'a',
        'persistent': True
    })
    access_token, csrf_token = res.headers.get_all('Set-Cookie')
    assert access_token.startswith('access_token_cookie')
    assert 'Max-Age=2592000' in access_token
    assert 'HttpOnly' in access_token


def test_logout(client):
    # can now log out
    res = client.post('/v0/logout')
    assert res.status_code == 200

    # is not logged in any more
    res = client.get('/v0/whoami')
    assert res.status_code == 401
