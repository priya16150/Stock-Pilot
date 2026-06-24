import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from bson import ObjectId
from flask import current_app
from app.config.database import get_collection

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv('SECRET_KEY')

    @property
    def users(self):
        return get_collection('users')

    def hash_password(self, password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, plain_password, hashed_password):
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    def create_user(self, user_data):
        # Check if user exists
        existing_user = self.users.find_one({
            '$or': [
                {'email': user_data.email},
                {'username': user_data.username}
            ]
        })
        if existing_user:
            return None

        # Hash password
        hashed_password = self.hash_password(user_data.password)

        # Create user document
        user_doc = {
            'username': user_data.username,
            'email': user_data.email,
            'password': hashed_password,
            'full_name': user_data.full_name,
            'role': getattr(user_data, 'role', 'user'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = self.users.insert_one(user_doc)
        user_doc['_id'] = result.inserted_id
        return user_doc

    def authenticate_user(self, email, password):
        user = self.users.find_one({'email': email})
        if not user:
            return None

        if not self.verify_password(password, user['password']):
            return None

        return user

    def generate_token(self, user_id, email):
        payload = {
            'user_id': str(user_id),
            'email': email,
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')

    def verify_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except:
            return None

    def get_user_by_id(self, user_id):
        try:
            user = self.users.find_one({'_id': ObjectId(user_id)})
            return user
        except:
            return None

    def get_user_by_email(self, email):
        return self.users.find_one({'email': email})

    def update_user(self, user_id, update_data):
        """Update user profile fields"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except:
            return False

    def change_password(self, user_id, current_password, new_password):
        """Change user password after verifying current password"""
        try:
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return False
            if not self.verify_password(current_password, user['password']):
                return False
            new_hashed = self.hash_password(new_password)
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'password': new_hashed, 'updated_at': datetime.utcnow()}}
            )
            return result.modified_count > 0
        except:
            return False