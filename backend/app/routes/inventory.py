from flask import Blueprint, request, jsonify
from app.services.product_service import ProductService

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')
product_service = ProductService()

@inventory_bp.route('/', methods=['GET'], strict_slashes=False)
def get_inventory():
    """Get all inventory"""
    try:
        products = product_service.get_all_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/low-stock', methods=['GET'])
def get_low_stock():
    """Get low stock items"""
    try:
        products = product_service.get_low_stock_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/update/<product_id>', methods=['PUT'])
def update_inventory(product_id):
    """Update inventory quantity"""
    try:
        data = request.json
        quantity_change = data.get('quantity_change', 0)
        
        product = product_service.get_product_by_id(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        new_quantity = product['quantity'] + quantity_change
        if new_quantity < 0:
            return jsonify({'error': 'Insufficient stock'}), 400
        
        updated = product_service.update_product(product_id, {'quantity': new_quantity})
        if updated:
            return jsonify({
                'product_id': product_id,
                'new_quantity': new_quantity
            }), 200
        return jsonify({'error': 'Failed to update inventory'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@inventory_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get inventory analytics"""
    try:
        stats = product_service.get_inventory_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500