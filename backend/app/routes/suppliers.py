from flask import Blueprint, request, jsonify
from app.services.supplier_service import SupplierService

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')
supplier_service = SupplierService()

@suppliers_bp.route('/', methods=['GET'], strict_slashes=False)
def get_suppliers():
    try:
        return jsonify(supplier_service.get_all_suppliers()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/', methods=['POST'], strict_slashes=False)
def create_supplier():
    try:
        data = request.json
        supplier = supplier_service.create_supplier(data)
        return jsonify(supplier), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    try:
        data = request.json
        supplier = supplier_service.update_supplier(supplier_id, data)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        return jsonify(supplier), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    try:
        if supplier_service.delete_supplier(supplier_id):
            return jsonify({'message': 'Supplier deleted'}), 200
        return jsonify({'error': 'Supplier not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Purchase Orders
@suppliers_bp.route('/orders', methods=['GET'], strict_slashes=False)
def get_orders():
    try:
        return jsonify(supplier_service.get_all_purchase_orders()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/orders/<order_id>/receive', methods=['POST'])
def receive_order(order_id):
    try:
        order = supplier_service.mark_purchase_order_received(order_id)
        if not order:
            return jsonify({'error': 'Order not found or already received'}), 400
        return jsonify(order), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
