from datetime import datetime
from bson import ObjectId

class Product:
    def __init__(self, data):
        self.id = str(data.get('_id')) if data.get('_id') else None
        self.name = data.get('name')
        self.barcode = data.get('barcode')
        self.category = data.get('category')
        self.price = data.get('price')
        self.quantity = data.get('quantity')
        self.min_quantity = data.get('min_quantity', 5)
        self.supplier = data.get('supplier')
        self.image_url = data.get('image_url')
        self.created_at = data.get('created_at', datetime.utcnow())
        self.updated_at = data.get('updated_at', datetime.utcnow())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'barcode': self.barcode,
            'category': self.category,
            'price': self.price,
            'quantity': self.quantity,
            'min_quantity': self.min_quantity,
            'supplier': self.supplier,
            'image_url': self.image_url,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'barcode': self.barcode,
            'category': self.category,
            'price': self.price,
            'quantity': self.quantity,
            'min_quantity': self.min_quantity,
            'supplier': self.supplier,
            'image_url': self.image_url
        }