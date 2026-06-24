from app.main import create_app
from flask import request

app = create_app()

@app.route('/test-typeerror', methods=['POST'])
def test_typeerror():
    if 'image' not in request.json:
        return "ok"
    return "not ok"

with app.test_client() as client:
    res = client.post('/test-typeerror', data=b'random binary data', content_type='multipart/form-data; boundary=1234')
    print("Status:", res.status_code)
    print("Data:", res.data)
