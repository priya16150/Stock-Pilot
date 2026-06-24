"""
Inventory Service
Manages inventory operations including stock tracking, low stock alerts,
and inventory analytics
"""

from datetime import datetime
from bson import ObjectId
from app.config.database import get_db

class InventoryService:
    @property
    def db(self):
        return get_db()

    def get_inventory(self):
        """Get all inventory items with product details"""
        products = self.db.products.find().sort('name', 1)
        result = []
        for product in products:
            product['id'] = str(product['_id'])
            result.append(product)
        return result

    def get_low_stock_items(self):
        """Get products that are low on stock"""
        products = self.db.products.find({
            '$expr': {'$lte': ['$quantity', '$min_quantity']}
        })
        result = []
        for product in products:
            product['id'] = str(product['_id'])
            result.append(product)
        return result

    def get_critical_stock_items(self):
        """Get products that are critically low (quantity = 0)"""
        products = self.db.products.find({'quantity': 0})
        result = []
        for product in products:
            product['id'] = str(product['_id'])
            result.append(product)
        return result

    def update_stock(self, product_id, quantity_change):
        """Update product stock quantity"""
        try:
            product = self.db.products.find_one({'_id': ObjectId(product_id)})
            if not product:
                return None
            
            new_quantity = product['quantity'] + quantity_change
            if new_quantity < 0:
                return {'error': 'Insufficient stock'}
            
            result = self.db.products.update_one(
                {'_id': ObjectId(product_id)},
                {
                    '$set': {
                        'quantity': new_quantity,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                return {
                    'product_id': product_id,
                    'old_quantity': product['quantity'],
                    'new_quantity': new_quantity,
                    'change': quantity_change
                }
            return None
        except:
            return None

    def bulk_update_stock(self, updates):
        """Update multiple products stock at once"""
        results = []
        for update in updates:
            product_id = update.get('product_id')
            quantity_change = update.get('quantity_change', 0)
            result = self.update_stock(product_id, quantity_change)
            if result:
                results.append(result)
        return results

    def get_inventory_value(self):
        """Calculate total inventory value"""
        pipeline = [
            {'$group': {
                '_id': None,
                'total_value': {'$sum': {'$multiply': ['$price', '$quantity']}}
            }}
        ]
        result = list(self.db.products.aggregate(pipeline))
        return result[0]['total_value'] if result else 0

    def get_stock_alerts(self):
        """Get all stock alerts (low and critical)"""
        low_stock = self.get_low_stock_items()
        critical_stock = self.get_critical_stock_items()
        
        alerts = []
        for item in critical_stock:
            alerts.append({
                'product_id': item['id'],
                'product_name': item['name'],
                'current_quantity': item['quantity'],
                'alert_type': 'critical',
                'message': f"{item['name']} is out of stock!"
            })
        
        for item in low_stock:
            if item['quantity'] > 0:
                alerts.append({
                    'product_id': item['id'],
                    'product_name': item['name'],
                    'current_quantity': item['quantity'],
                    'min_quantity': item['min_quantity'],
                    'alert_type': 'low',
                    'message': f"{item['name']} is running low on stock ({item['quantity']} left)"
                })
        
        return alerts

    def get_inventory_report(self):
        """Generate inventory report"""
        products = self.db.products.find()
        total_products = self.db.products.count_documents({})
        total_value = self.get_inventory_value()
        low_stock_count = len(self.get_low_stock_items())
        critical_count = len(self.get_critical_stock_items())
        
        # Category breakdown
        category_pipeline = [
            {'$group': {
                '_id': '$category',
                'count': {'$sum': 1},
                'total_value': {'$sum': {'$multiply': ['$price', '$quantity']}}
            }},
            {'$sort': {'_id': 1}}
        ]
        category_breakdown = list(self.db.products.aggregate(category_pipeline))
        
        return {
            'total_products': total_products,
            'total_value': total_value,
            'low_stock_items': low_stock_count,
            'critical_stock_items': critical_count,
            'category_breakdown': category_breakdown,
            'generated_at': datetime.utcnow().isoformat()
        }