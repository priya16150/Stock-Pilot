import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.config.database import init_db
from app.models.product import Product
from app.services.product_service import ProductService
from flask import Flask

app = Flask(__name__)
init_db(app)
with app.app_context():
    service = ProductService()
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
    prod = Product(data)
    try:
        res = service.create_product(prod)
        print("Success:", res)
    except Exception as e:
        print("Error:", repr(e))
