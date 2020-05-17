"""
Testing the API functionality (creating/editing notes etc).
"""


def test_no_notes(logged_in_client):
    body = logged_in_client.get('/v0/notes').get_json()
    assert body['notes'] == []


def test_create_notes(logged_in_client):
    logged_in_client.post('/v0/notes', json={'title': 'title0', 'markdown': 'markdown0'})
    logged_in_client.post('/v0/notes', json={'title': 'title1', 'markdown': 'markdown1'})

    body = logged_in_client.get('/v0/notes').get_json()
    assert 'notes' in body
    assert len(body['notes']) == 2
    notes = body['notes']
    assert notes[0]['title'] == 'title0'
    assert notes[0]['id'] is not None


def test_update_note(logged_in_client):
    notes = logged_in_client.get('/v0/notes').get_json()['notes']

    updated_note = {'title': 'updated', 'markdown': 'updated markdown'}
    assert logged_in_client.put(f'/v0/notes/{notes[0]["id"]}', json=updated_note)

    updated_notes = logged_in_client.get('/v0/notes').get_json()['notes']
    assert updated_notes[0]['title'] == 'updated'


def test_tag_note(logged_in_client):
    note = logged_in_client.get('/v0/notes').get_json()['notes'][1]
    assert note['tags'] == []

    note['tags'] = ['green', 'blue']
    logged_in_client.put(f'/v0/notes/{note["id"]}', json=note)

    note = logged_in_client.get('/v0/notes').get_json()['notes'][1]
    assert set(note['tags']) == {'green', 'blue'}


def test_delete_notes(logged_in_client):
    notes = logged_in_client.get('/v0/notes').get_json()['notes']

    logged_in_client.delete(f'/v0/notes/{notes[0]["id"]}')
    updated_notes = logged_in_client.get('/v0/notes').get_json()['notes']
    assert len(updated_notes) == 1

    logged_in_client.delete(f'/v0/notes/{notes[1]["id"]}')
    updated_notes = logged_in_client.get('/v0/notes').get_json()['notes']
    assert len(updated_notes) == 0
