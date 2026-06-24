from datetime import datetime, timedelta
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

class TransactionService:
    @property
    def db(self):
        return get_db()

    def create_transaction(self, transaction_data):
        """Create a new transaction"""
        # Validate and update inventory
        for item in transaction_data.get('items', []):
            product = self.db.products.find_one({'_id': ObjectId(item['product_id'])})
            if not product:
                return {'error': f"Product not found: {item.get('product_name')}"}
            
            
            new_quantity = int(product.get('quantity', 0)) - int(item.get('quantity', 0))
            if new_quantity < 0:
                return {'error': f"Insufficient stock for {product.get('name', 'product')}. Available: {product.get('quantity', 0)}"}
            
            # Update inventory
            self.db.products.update_one(
                {'_id': ObjectId(item['product_id'])},
                {'$set': {'quantity': new_quantity, 'updated_at': datetime.utcnow()}}
            )
            
            # Check if auto-restock needed
            min_qty = product.get('min_quantity', 5)
            if new_quantity <= min_qty:
                # check if there's already a pending order
                existing_order = self.db.purchase_orders.find_one({
                    'product_id': str(product['_id']),
                    'status': 'Pending'
                })
                if not existing_order:
                    # Create purchase order
                    restock_amount = max(20, min_qty * 3) # Arbitrary restock logic
                    po_doc = {
                        'product_id': str(product['_id']),
                        'product_name': product.get('name'),
                        'supplier_name': product.get('supplier', 'Unknown'),
                        'quantity': restock_amount,
                        'status': 'Pending',
                        'created_at': datetime.utcnow()
                    }
                    self.db.purchase_orders.insert_one(po_doc)

        # Create transaction
        transaction_doc = {
            'transaction_type': transaction_data.get('transaction_type', 'sale'),
            'items': transaction_data.get('items', []),
            'total_amount': transaction_data.get('total_amount', 0),
            'payment_method': transaction_data.get('payment_method', 'cash'),
            'customer_email': transaction_data.get('customer_email'),
            'cashier_id': transaction_data.get('cashier_id'),
            'created_at': datetime.utcnow()
        }

        result = self.db.transactions.insert_one(transaction_doc)
        transaction_doc['_id'] = result.inserted_id
        return _serialize(transaction_doc)

    def get_transactions(self, limit=100):
        """Get recent transactions"""
        transactions = self.db.transactions.find().sort('created_at', -1).limit(limit)
        return [_serialize(t) for t in transactions]

    def get_transaction_by_id(self, transaction_id):
        """Get transaction by ID"""
        try:
            transaction = self.db.transactions.find_one({'_id': ObjectId(transaction_id)})
            return _serialize(transaction)
        except:
            return None

    def get_weekly_analysis(self):
        """Get weekly sales analysis"""
        # Get last 7 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        pipeline = [
            {'$match': {
                'created_at': {'$gte': start_date, '$lte': end_date}
            }},
            {'$group': {
                '_id': {'$dayOfWeek': '$created_at'},
                'sales': {'$sum': 1},
                'revenue': {'$sum': '$total_amount'}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        results = list(self.db.transactions.aggregate(pipeline))
        
        # Map to days of week
        days_map = {
            1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 
            5: 'Fri', 6: 'Sat', 7: 'Sun'
        }
        
        weekly_data = []
        for result in results:
            weekly_data.append({
                'day': days_map.get(result['_id'], 'Unknown'),
                'sales': result['sales'],
                'revenue': result['revenue']
            })
        
        return weekly_data

    def get_daily_stats(self):
        """Get daily statistics"""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        pipeline = [
            {'$match': {
                'created_at': {'$gte': today}
            }},
            {'$group': {
                '_id': None,
                'total_sales': {'$sum': 1},
                'total_revenue': {'$sum': '$total_amount'}
            }}
        ]
        
        results = list(self.db.transactions.aggregate(pipeline))
        
        if results:
            return {
                'total_sales': results[0]['total_sales'],
                'total_revenue': results[0]['total_revenue']
            }
        return {'total_sales': 0, 'total_revenue': 0}