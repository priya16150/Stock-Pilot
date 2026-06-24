import requests

# Get token from db directly
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token
from app.main import create_app

load_dotenv()
app = create_app()

with app.app_context():
    token = create_access_token(identity='knh@gmail.com')

# Analyze image
files = {'image': ('test.jpg', b'dummy_data', 'image/jpeg')}
headers = {'Authorization': f'Bearer {token}'}

# test 1: proper requests
res = requests.post('http://127.0.0.1:8000/api/ai/analyze-image', files=files, headers=headers)
print("Analyze status 1:", res.status_code, res.text)

# test 2: axios-like boundary strip
headers['Content-Type'] = 'multipart/form-data'
res = requests.post('http://127.0.0.1:8000/api/ai/analyze-image', data=b'raw data', headers=headers)
print("Analyze status 2:", res.status_code, res.text)
