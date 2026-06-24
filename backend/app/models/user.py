from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, data):
        self.id = str(data.get('_id')) if data.get('_id') else None
        self.username = data.get('username')
        self.email = data.get('email')
        self.password = data.get('password')
        self.full_name = data.get('full_name')
        self.role = data.get('role', 'user')
        self.created_at = data.get('created_at', datetime.utcnow())
        self.updated_at = data.get('updated_at', datetime.utcnow())

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role
        }

class UserCreate:
    def __init__(self, data):
        self.username = data.get('username')
        self.email = data.get('email')
        self.password = data.get('password')
        self.full_name = data.get('full_name')
        self.role = data.get('role', 'user')

class UserLogin:
    def __init__(self, data):
        self.email = data.get('email')
        self.password = data.get('password')