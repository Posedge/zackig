import requests
from flask import request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import app
from models import NoteModel
from service.linkpreview import LinkPreview


@app.route('/v0/notes', methods=['GET'])
@jwt_required
def get_notes():
    user = get_jwt_identity()
    notes = NoteModel.find_all_by_userid(user)
    # note: the html/markdown is escaped in the client before rendering
    return_notes = [{
        'id': n.id,
        'title': n.title,
        'markdown': n.markdown,
        'tags': n.tags if n.tags is not None else []
    } for n in notes]
    return {'notes': return_notes}


@app.route('/v0/notes', methods=['POST'])
@jwt_required
def post_note():
    body = request.get_json()
    if body is None or 'title' not in body or 'markdown' not in body:
        return {'message': 'note title or markdown not supplied'}, 400

    user = get_jwt_identity()
    try:
        tags = body.get('tags', [])
        new_note = NoteModel(title=body['title'], markdown=body['markdown'], userid=user, tags=tags)
        new_note.insert()
    except Exception as e:
        app.logger.error(f'error saving note', exc_info=e)
        return {'message': 'something went wrong'}, 500

    return {'message': f'note \'{new_note.id}\' created', 'id': new_note.id}


@app.route('/v0/notes/<string:noteid>', methods=['PUT'])
@jwt_required
def put_note(noteid):
    user = get_jwt_identity()
    note = NoteModel.find_by_id(noteid)
    if note is None or note.userid != user:
        return {'message': 'no such note'}, 404

    body = request.get_json()
    if body is None or ('title' not in body and 'markdown' not in body and 'tags' not in body):
        return {'message': 'no note fields supplied'}, 400

    try:
        if 'title' in body:
            note.title = body['title']
        if 'markdown' in body:
            note.markdown = body['markdown']
        if 'tags' in body:
            note.tags = list(set(body['tags']))
        note.update()
    except Exception as e:
        app.logger.error(f'error updating note', exc_info=e)
        return {'message': 'something went wrong'}, 500

    return {'message': 'note updated'}


@app.route('/v0/notes/<string:noteid>', methods=['DELETE'])
@jwt_required
def delete_note(noteid):
    user = get_jwt_identity()
    note = NoteModel.find_by_id(noteid)
    if not note or note.userid != user:
        return {'message': 'no such note'}, 404

    try:
        NoteModel.delete_by_id(noteid)
    except Exception as e:
        app.logger.error(f'error deleting note', exc_info=e)
        return {'message': 'something went wrong'}, 500

    return {'message': f'deleted note \'{noteid}\'.'}


@app.route('/v0/linkpreview', methods=['GET'])
@jwt_required
def render_link_preview():
    if 'url' not in request.args:
        return {'error': 'no url parameter provided'}, 400
    try:
        preview = LinkPreview.fetch_from_url(request.args['url'])
    except Exception as e:
        app.logger.error(f'error rendering link preview', exc_info=e)
        return {'error': 'something went wrong'}, 500
    return preview.to_dict()


@app.route('/v0/imageproxy', methods=["GET"])
@jwt_required
def proxy_url():
    """
    Images to external sites have to be proxied through our backend,
    otherwise these requests are often blocked due to CORS policies and browser tracking protection.
    """
    if 'url' not in request.args:
        return {'error': 'no url parameter provided'}, 400
    try:
        image_response = requests.get(request.args['url'])
        response = make_response(image_response.content, 200)
        response.headers['Content-Type'] = image_response.headers['content-type']
        return response
    except Exception as e:
        app.logger.error(f'error proxying image', exc_info=e)
        return {'error': 'something went wrong'}, 500
