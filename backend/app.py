import os
from distutils.util import strtobool

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)


# Configuration
server_secret = os.environ.get('ZKG_SECRET_KEY', '')
if not server_secret:
    app.logger.warn('set ZKG_SECRET_KEY in your environment!')
    server_secret = '0000'
mongodb_password = os.environ.get('ZKG_MONGODB_PASSWORD', 'admin')
connection_string = os.environ.get('ZKG_MONGODB', 'mongodb://admin:{password}@localhost:27017')
db_collection = os.environ.get('ZKG_MONGODB_COLLECTION', 'zackig')
app.config['TESTING'] = strtobool(os.environ.get('ZKG_TESTING', 'false'))
app.config['SECRET_KEY'] = server_secret
app.config['JWT_SECRET_KEY'] = server_secret
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = strtobool(os.environ.get('ZKG_COOKIE_SECURE', 'true'))
app.config['JWT_CSRF_IN_COOKIES'] = True
if strtobool(os.environ.get('ZKG_DISABLE_CSRF_CHECK', 'false')):
    app.config['JWT_CSRF_METHODS'] = []


# Set up Flask app and DB
cors = CORS(app, supports_credentials=True)
jwt = JWTManager(app)
mongodb_client = MongoClient(connection_string.format(password=mongodb_password))
db = mongodb_client[db_collection]


from routes import general, auth, api


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
