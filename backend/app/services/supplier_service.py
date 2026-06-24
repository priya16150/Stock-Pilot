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

class SupplierService:
    @property
    def db(self):
        return get_db()

    def get_all_suppliers(self):
        suppliers = self.db.suppliers.find().sort('name', 1)
        return [_serialize(s) for s in suppliers]

    def create_supplier(self, data):
        supplier_doc = {
            'name': data.get('name'),
            'contact_person': data.get('contact_person', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'address': data.get('address', ''),
            'created_at': datetime.utcnow()
        }
        result = self.db.suppliers.insert_one(supplier_doc)
        supplier_doc['_id'] = result.inserted_id
        return _serialize(supplier_doc)

    def update_supplier(self, supplier_id, data):
        update_doc = {k: v for k, v in data.items() if k in ['name', 'contact_person', 'email', 'phone', 'address']}
        result = self.db.suppliers.update_one(
            {'_id': ObjectId(supplier_id)},
            {'$set': update_doc}
        )
        if result.modified_count > 0 or result.matched_count > 0:
            return self.get_supplier_by_id(supplier_id)
        return None

    def get_supplier_by_id(self, supplier_id):
        try:
            supplier = self.db.suppliers.find_one({'_id': ObjectId(supplier_id)})
            return _serialize(supplier)
        except:
            return None

    def delete_supplier(self, supplier_id):
        result = self.db.suppliers.delete_one({'_id': ObjectId(supplier_id)})
        return result.deleted_count > 0

    # Purchase Orders
    def get_all_purchase_orders(self):
        orders = self.db.purchase_orders.find().sort('created_at', -1)
        return [_serialize(o) for o in orders]

    def mark_purchase_order_received(self, order_id):
        order = self.db.purchase_orders.find_one({'_id': ObjectId(order_id)})
        if not order or order.get('status') == 'Completed':
            return None
        
        # Increment product stock
        product_id = order.get('product_id')
        restock_quantity = order.get('quantity', 0)
        
        # update inventory
        if product_id:
            try:
                self.db.products.update_one(
                    {'_id': ObjectId(product_id)},
                    {'$inc': {'quantity': restock_quantity}, '$set': {'updated_at': datetime.utcnow()}}
                )
            except:
                pass

        # Mark order as completed
        self.db.purchase_orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'status': 'Completed', 'received_at': datetime.utcnow()}}
        )
        
        return self.get_purchase_order_by_id(order_id)
        
    def get_purchase_order_by_id(self, order_id):
        try:
            order = self.db.purchase_orders.find_one({'_id': ObjectId(order_id)})
            return _serialize(order)
        except:
            return None
