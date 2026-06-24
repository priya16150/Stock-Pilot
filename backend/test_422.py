from app.main import create_app
from flask_jwt_extended import create_access_token

app = create_app()

with app.test_client() as client:
    with app.app_context():
        token = create_access_token(identity='knh@gmail.com')
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'multipart/form-data'
        }
    
    res = client.post('/api/ai/analyze-image', headers=headers, data=b'some random binary data')
    print("Status:", res.status_code)
    print("Data:", res.data)
