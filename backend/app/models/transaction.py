from datetime import datetime
from bson import ObjectId

class Transaction:
    def __init__(self, data):
        self.id = str(data.get('_id')) if data.get('_id') else None
        self.transaction_type = data.get('transaction_type')
        self.items = data.get('items', [])
        self.total_amount = data.get('total_amount')
        self.payment_method = data.get('payment_method')
        self.customer_email = data.get('customer_email')
        self.cashier_id = data.get('cashier_id')
        self.created_at = data.get('created_at', datetime.utcnow())

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'items': self.items,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'customer_email': self.customer_email,
            'cashier_id': self.cashier_id,
            'created_at': self.created_at
        }

    def to_json(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'items': self.items,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'customer_email': self.customer_email,
            'cashier_id': self.cashier_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }