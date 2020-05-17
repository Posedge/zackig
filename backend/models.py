from dataclasses import dataclass, asdict
from typing import List

from bson import ObjectId
from passlib.hash import pbkdf2_sha256 as sha256
from pymongo.database import Database

from app import db
db: Database


@dataclass
class UserModel:
    username: str
    pwhash: str
    id: str = None

    @staticmethod
    def hash_password(password):
        return sha256.hash(password)

    @staticmethod
    def verify_password(password, hash):
        return sha256.verify(password, hash)

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

    @classmethod
    def find_by_username(cls, username):
        doc = db['users'].find_one({'username': username})
        if doc is not None:
            return UserModel(username=doc['username'], pwhash=doc['pwhash'], id=str(doc['_id']))


@dataclass
class NoteModel:
    title: str
    markdown: str
    userid: str
    tags: List[str]
    id: str = None

    def insert(self):
        new_doc = db['notes'].insert_one({
            'title': self.title,
            'markdown': self.markdown,
            'userid': ObjectId(self.userid),
            'tags': self.tags
        })
        self.id = str(new_doc.inserted_id)

    def update(self):
        update_result = db['notes'].update({'_id': ObjectId(self.id)}, {'$set': {
            'title': self.title,
            'markdown': self.markdown,
            'userid': ObjectId(self.userid),
            'tags': self.tags
        }})

    @classmethod
    def find_by_id(cls, noteid):
        doc = db['notes'].find_one({'_id': ObjectId(noteid)})
        if doc is not None:
            return NoteModel(doc['title'], doc['markdown'], str(doc['userid']), doc['tags'], str(doc['_id']))

    @classmethod
    def delete_by_id(cls, noteid):
        db['notes'].delete_one({'_id': ObjectId(noteid)})

    @classmethod
    def find_all_by_userid(cls, userid):
        docs = db['notes'].find({'userid': ObjectId(userid)})
        return [
            NoteModel(doc['title'], doc['markdown'], str(doc['userid']), doc['tags'], str(doc['_id']))
            for doc in docs
        ]
