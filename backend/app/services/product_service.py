from datetime import datetime
from bson import ObjectId
from app.config.database import get_db

def _serialize(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [_serialize(v) if isinstance(v, dict) else (str(v) if isinstance(v, ObjectId) else v) for v in value]
        elif isinstance(value, dict):
            result[key] = _serialize(value)
        else:
            result[key] = value
    if '_id' in result and 'id' not in result:
        result['id'] = result['_id']
    return result

class ProductService:
    @property
    def db(self):
        return get_db()

    def create_product(self, product_data):
        """Create a new product"""
        # Check if barcode exists
        existing = self.db.products.find_one({'barcode': product_data.get('barcode')})
        if existing:
            return None

        product_doc = {
            'name': product_data.get('name'),
            'barcode': product_data.get('barcode'),
            'category': product_data.get('category'),
            'price': float(product_data.get('price', 0)),
            'quantity': int(product_data.get('quantity', 0)),
            'min_quantity': int(product_data.get('min_quantity', 5)),
            'supplier': product_data.get('supplier', ''),
            'image_url': product_data.get('image_url', ''),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = self.db.products.insert_one(product_doc)
        product_doc['_id'] = result.inserted_id
        return _serialize(product_doc)

    def get_all_products(self):
        """Get all products"""
        products = self.db.products.find().sort('name', 1)
        return [_serialize(product) for product in products]

    def get_product_by_id(self, product_id):
        """Get product by ID"""
        try:
            product = self.db.products.find_one({'_id': ObjectId(product_id)})
            return _serialize(product)
        except:
            return None

    def get_product_by_barcode(self, barcode):
        """Get product by barcode"""
        product = self.db.products.find_one({'barcode': barcode})
        return _serialize(product)

    def update_product(self, product_id, update_data):
        """Update product"""
        # Ensure numerical types
        if 'price' in update_data:
            try:
                update_data['price'] = float(update_data['price']) if update_data['price'] else 0.0
            except ValueError:
                update_data['price'] = 0.0
        if 'quantity' in update_data:
            try:
                update_data['quantity'] = int(update_data['quantity']) if update_data['quantity'] else 0
            except ValueError:
                update_data['quantity'] = 0
        if 'min_quantity' in update_data:
            try:
                update_data['min_quantity'] = int(update_data['min_quantity']) if update_data['min_quantity'] else 5
            except ValueError:
                update_data['min_quantity'] = 5
                
        update_data['updated_at'] = datetime.utcnow()
        result = self.db.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': update_data}
        )
        if result.modified_count > 0 or result.matched_count > 0:
            return self.get_product_by_id(product_id)
        return None

    def delete_product(self, product_id):
        """Delete product"""
        result = self.db.products.delete_one({'_id': ObjectId(product_id)})
        return result.deleted_count > 0

    def get_low_stock_products(self):
        """Get products with low stock"""
        products = self.db.products.find({
            '$expr': {'$lte': ['$quantity', '$min_quantity']}
        })
        return [_serialize(product) for product in products]

    def get_inventory_stats(self):
        """Get inventory statistics"""
        total_products = self.db.products.count_documents({})
        
        # Calculate total inventory value
        pipeline = [
            {'$group': {
                '_id': None,
                'total': {'$sum': {'$multiply': ['$price', '$quantity']}}
            }}
        ]
        total_value = list(self.db.products.aggregate(pipeline))
        
        low_stock = self.db.products.count_documents({
            '$expr': {'$lte': ['$quantity', '$min_quantity']}
        })

        return {
            'total_products': total_products,
            'total_inventory_value': total_value[0]['total'] if total_value else 0,
            'low_stock_items': low_stock
        }

    def get_fast_moving_products(self, limit=5):
        """Get fast moving products based on transaction history"""
        pipeline = [
            {'$unwind': '$items'},
            {'$group': {
                '_id': '$items.product_id',
                'total_sold': {'$sum': '$items.quantity'},
                'revenue': {'$sum': {'$multiply': ['$items.quantity', '$items.price']}},
                'product_name': {'$first': '$items.product_name'},
                'barcode': {'$first': '$items.barcode'}
            }},
            {'$sort': {'total_sold': -1}},
            {'$limit': limit}
        ]
        
        results = list(self.db.transactions.aggregate(pipeline))
        fast_moving = []
        for item in results:
            try:
                product = self.db.products.find_one({'_id': ObjectId(item['_id'])})
            except Exception:
                product = None
            fast_moving.append({
                'id': str(item['_id']) if item['_id'] else '',
                'name': item.get('product_name', 'Unknown'),
                'barcode': item.get('barcode', ''),
                'total_sold': item.get('total_sold', 0),
                'revenue': item.get('revenue', 0),
                'quantity': product['quantity'] if product else 0
            })
        return fast_moving