import os
import sys
from dotenv import load_dotenv

# Allow imports from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment
load_dotenv()

from flask import Flask
from app.config.database import init_db
from app.services.auth_service import AuthService
from app.models.user import UserCreate

def create_default_admin():
    # Initialize Flask app to set up context
    app = Flask(__name__)
    
    print("Connecting to database...")
    init_db(app)
    
    auth_service = AuthService()
    
    admin_data = {
        'email': 'admin@gmil.com',
        'password': 'admin123',
        'username': 'admin',
        'full_name': 'Administrator'
    }
    
    user_create = UserCreate(admin_data)
    
    # Check if user already exists
    existing = auth_service.collection.find_one({'email': admin_data['email']})
    if existing:
        print(f"User {admin_data['email']} already exists!")
        return
        
    print(f"Creating user {admin_data['email']}...")
    result = auth_service.create_user(user_create)
    
    if result:
        print(f"Successfully created admin user: {admin_data['email']} / {admin_data['password']}")
    else:
        print("Failed to create user.")

if __name__ == '__main__':
    create_default_admin()
