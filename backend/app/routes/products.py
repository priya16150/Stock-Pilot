from flask import Blueprint, request, jsonify
from app.services.product_service import ProductService
from app.models.product import Product

products_bp = Blueprint('products', __name__, url_prefix='/api/products')
product_service = ProductService()

@products_bp.route('/', methods=['GET'], strict_slashes=False)
def get_products():
    """Get all products"""
    try:
        products = product_service.get_all_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['POST'], strict_slashes=False)
def create_product():
    """Create a new product"""
    try:
        data = request.json
        product_data = Product(data)
        
        product = product_service.create_product(product_data.to_dict())
        if not product:
            return jsonify({'error': 'Product with this barcode already exists'}), 400
        
        product['id'] = str(product['_id'])
        return jsonify(product), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get product by ID"""
    try:
        product = product_service.get_product_by_id(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/barcode/<barcode>', methods=['GET'])
def get_product_by_barcode(barcode):
    """Get product by barcode"""
    try:
        product = product_service.get_product_by_barcode(barcode)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product"""
    try:
        data = request.json
        product = product_service.update_product(product_id, data)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product"""
    try:
        if product_service.delete_product(product_id):
            return jsonify({'message': 'Product deleted successfully'}), 200
        return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500