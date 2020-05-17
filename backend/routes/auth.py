"""
Authentication routes, implementing a JWT-based sign up and log in.
Mostly based on https://codeburst.io/jwt-authorization-in-flask-c63c1acf4eeb
"""
import traceback
from datetime import timedelta

from flask import escape, request, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies, unset_access_cookies

from app import app
from models import UserModel


@app.route('/v0/register', methods=['POST'])
def register():
    data = request.get_json()
    if data is None or 'username' not in data or 'password' not in data:
        return {'message': 'username or password parameters not supplied'}, 400
    username = data['username']

    if UserModel.find_by_username(username) is not None:
        return {'message': 'user already exists'}, 400

    try:
        new_user = UserModel(
            username=username,
            pwhash=UserModel.hash_password(data['password'])
        )
        new_user.insert()

        return {
            'message': f'created user \'{escape(new_user.username)}\'.'
        }
    except Exception as e:
        traceback.print_tb(e)
        return {'message': 'something went wrong'}, 500


@app.route('/v0/login', methods=['POST'])
def login():
    data = request.get_json()
    if data is None or 'username' not in data or 'password' not in data:
        return {'message': 'username or password parameters not supplied'}, 400
    username = data['username']
    password = data['password']
    persistent_login = data.get('persistent', False)

    current_user = UserModel.find_by_username(username)
    if current_user is None:
        return {'message': 'no such user'}, 401

    if not UserModel.verify_password(password, current_user.pwhash):
        return {'message': 'wrong credentials'}, 401

    if persistent_login:
        validity_seconds = 3600 * 24 * 30
    else:
        validity_seconds = 3600
    access_token = create_access_token(
        identity=current_user.id,
        expires_delta=timedelta(seconds=validity_seconds))
    payload = {
        'message': f'logged in as \'{escape(current_user.username)}\'.',
        'username': username
    }

    response = make_response(payload)
    # max_age of None sets a session cookie
    cookie_max_age = validity_seconds if persistent_login else None
    set_access_cookies(response, access_token, max_age=cookie_max_age)
    return response


@app.route('/v0/logout', methods=['POST'])
def logout():
    response = make_response({'message': 'logged out.'})
    unset_access_cookies(response)
    return response


@app.route('/v0/whoami', methods=['GET'])
@jwt_required
def whoami():
    userid = get_jwt_identity()
    user = UserModel.find_by_id(userid)
    if not user:
        return {'message': 'no such user.'}, 401
    return {
        'username': user.username,
        'message': f'logged in as {user.username}.'
    }

