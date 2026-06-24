import requests

data = {
    "name": "milk bicks",
    "barcode": "7410",
    "category": "Grocery",
    "price": "10",
    "quantity": "10",
    "min_quantity": "5",
    "supplier": "britaniya",
    "image_url": "https://nishanthk.site"
}

try:
    response = requests.post('http://127.0.0.1:8000/api/products/', json=data)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print(e)
