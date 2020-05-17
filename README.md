# Zackig

Your Hackthon-ready CRUD boilerplate! *Aber zackig!*

## What it is

This boilerplate handles a minimal set of common SaaS functionality, such as registering and logging in users, displaying/storing data, and it provides a simple frontend.
Based on a simple and modern tech stack, with react/redux, flask, and mongodb.

This project is built with hackathons in mind:

1. **Get up and running in minimal time**: just run `docker-compose up`.
    This launches a development environment w/ auto-reload of frontend and backend code, and an ephimeral mongodb in a container.
    Navigate to [localhost:3000](http://localhost:3000), open the code and get hacking!
2. Focus on **simplicity**. Zackig ships with a limited set of features, but aims to keep the code **concise** and **unopinionated**.
    There is also a walkthrough in this README.
3. While not production-ready, it is supposed to be *productionalizable*, i.e. no "quick and dirty" design choices have been made
    that will get in your way if you do choose to make your project a real web app some day.

## What it isn't

* Fully-fledged, and production-ready SaaS boilerplate with all of the functionality you will need to launch a web app.
* Audited for security in any way.

## Features

This is essentially a very basic note app:
* Register, login, persistent login,
* Display a dashboard of notes,
* Edit notes in markdown and render html,
* Fetch and display a website preview if the note is a URL.

![login screen](login.png) ![dashboard](dashboard.png)

## Walkthrough Tour

To get you started quickly, here's a quick tour of the code.

### Backend

Simple flask app in the backend.
Have a look arount in [backend/](backend/), it should be fairly self-explanatory.
The default docker-compose config will serve this flask app at `localhost:5000`.

Dependencies are managed by [Pipenv](https://pipenv.pypa.io/en/latest/), pip's superior successor, if I may say so.

Define your request handlers in [backend/routes/](backend/routes/), e.g. like so:
```python
@app.route('/v0/notes', methods=['GET'])
@jwt_required
def get_notes():
    user = get_jwt_identity()
    notes = NoteModel.find_all_by_userid(user)
    return_notes = [{
        'id': n.id,
        'title': n.title,
        'markdown': n.markdown,
        'tags': n.tags if n.tags is not None else []
    } for n in notes]
    return {'notes': return_notes}
```

Data is persisted/retrieved from DB in [models](backend/models.py), e.g. like so:
```python

@dataclass
class UserModel:
    username: str
    pwhash: str
    id: str = None

    def insert(self):
        new_doc = db['users'].insert_one({
            'username': self.username,
            'pwhash': self.pwhash
        })
        self.id = str(new_doc.inserted_id)

    @classmethod
    def find_by_id(cls, userid):
        doc = db['users'].find_one({'_id': ObjectId(userid)})
        if doc is not None:
            return UserModel(doc['username'], doc['pwhash'], str(doc['_id']))
    
    # etc
```

### Frontend

Same thing with [frontend/](frontend/).
I guess React is still fairly popular and well known.
The default config serves your app at `frontend:3000` and connects to the backend at `localhost:5000`.

I tried keeping it vanilla, until at some point I got tired of bubbling state up and down the components and added redux (the corresponding store is [here](frontend/src/store/)).

I'm using the beautiful components of [shards-react](https://designrevision.com/docs/shards-react/getting-started).

### Persistence

For persistence we use a mongodb.
The dev environment contains a sandbox in a container:
```
mongodb:
  image: 'mongo:4'
  ports:
    - '27017:27017'
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: admin
```

To examine the db with the mongo shell, you can run `mongo` in the container:
```bash
docker-compose exec mongodb mongo -u admin -p admin
> show dbs
admin
config
local
zackig
zackig_testing
> etc...
```

If something get's messed up you can burn down and re-create the whole environment like so:
```bash
docker-compose down
docker-compose up --build --force-recreate
```

### Configuration

The backend is configured with environment variables, as in this excerpt from the [entry point](backend/app.py):
```python
server_secret = os.environ.get('ZKG_SECRET_KEY', '')
if not server_secret:
    app.logger.warn('set ZKG_SECRET_KEY in your environment!')
    server_secret = '0000'
mongodb_password = os.environ.get('ZKG_MONGODB_PASSWORD', 'admin')
connection_string = os.environ.get('ZKG_MONGODB', 'mongodb://admin:{password}@localhost:27017')
db_collection = os.environ.get('ZKG_MONGODB_COLLECTION', 'zackig')
# and so on
```

For your quickstart, Zackig comes with a default config in the code and in docker-compose.yml that runs out-of-the-box.
You can add your backend config and secrets by creating a backend/.env file, which will be picked up by the server:
```
ZKG_SECRET_KEY="4" # chosen by a fair dice roll
ZKG_MONGODB="mongodb+srv://user:{password}@some-mongodb.net"
```
This way you can e.g. connect to a managed mongodb hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

The frontend has externalized configuration as well, in [config.json](frontend/public/config.json):
```javascript
window.config = {
  API_URL: 'http://localhost:5000'
};
```

This is fetched in [the root html file](frontend/public/index.html):
```html
<!-- load runtime configuration: -->
<script src="%PUBLIC_URL%/config.js"></script>
```
And therefore available in your React components at `window.config`.

### Testing

The backend contains [tests](backend/tests/) based on [pytest](https://docs.pytest.org/en/latest/).
Run them with:
```bash
docker-compose exec backend pipenv run pytest
```

[conftest.py](backend/tests/conftest.py) contains fixtures that provide a client which can end-to-end test the API.

Write your tests [like so](backend/tests/api/test_api.py):
```python
def test_create_notes(logged_in_client):
    logged_in_client.post('/v0/notes', json={'title': 'title0', 'markdown': 'markdown0'})
    logged_in_client.post('/v0/notes', json={'title': 'title1', 'markdown': 'markdown1'})

    body = logged_in_client.get('/v0/notes').get_json()
    assert 'notes' in body
    assert len(body['notes']) == 2
    notes = body['notes']
    assert notes[0]['title'] == 'title0'
    assert notes[0]['id'] is not None
```

I don't know enough about frontend testing atm and I have not implemented any.

### Authentication

Zackig uses JWT tokens via [flask_jwt_extended](https://flask-jwt-extended.readthedocs.io/en/stable/) for authentication.

While JWT's usefulness is disputed, they make our life simpler here, since the backend doesn't have to maintain a session store and can be re-deployed without invalidating sessions.
The JWT token is stored in an HttpOnly cookie (as it should).
Logout is simply unsetting the token (although it remains valid).
The persistend login ("keep me logged in") is just a longer validity period of the token and the cookie that stores it (30 days).

There is no access token/refresh token split and silent renewal.
If your app leaks access tokens, it will also be leaking refresh tokens.

## Similar projects

Shout out to [PNGR](https://github.com/karlkeefer/pngr).
That's where I got the quickstart idea.
This project has a bit of a different focus though, as well as python in the backend.

Google searching for "crud boilerplate react flask" or similar will lead you to projects such as [React-Flask-SPA](https://github.com/briancappello/flask-react-spa) or [Saasforge](https://www.saasforge.dev/).
Unlike this project, these are production-ready.
The focus of Zackig instaed is an unopinionated, simple, and easy to extend code base, to get you started quickly.

## Contributing

Ideas, thoughts, criticism? Has this been useful, or can you suggest improvements?
Feel free to open an issue or PR or reach out to me.

If you build something cool with this, I'd love to hear about it.
Make sure to mention me on twitter [@vtrdev](https://twitter.com/vtrdev)!

## License
MIT.