import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.config.database import init_db
from app.services.transaction_service import TransactionService
from flask import Flask

app = Flask(__name__)
init_db(app)

with app.app_context():
    try:
        service = TransactionService()
        data = {
            "transaction_type": "sale",
            "items": [{"product_id": "6a3ac86a8fe5fce689c5c2b5", "product_name": "test", "barcode": "123", "quantity": 1, "price": 10, "total": 10}],
            "total_amount": 10,
            "payment_method": "cash"
        }
        res = service.create_transaction(data)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()
