from flask import Blueprint, request, jsonify
from app.services.product_service import ProductService
from app.services.inventory_service import InventoryService
from app.services.transaction_service import TransactionService

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')
product_service = ProductService()
transaction_service = TransactionService()
inventory_service = InventoryService()

@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        stats = product_service.get_inventory_stats()
        daily_stats = transaction_service.get_daily_stats()
        stats.update(daily_stats)
        report = inventory_service.get_inventory_report()
        stats['category_breakdown'] = report.get('category_breakdown', [])
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/fast-moving', methods=['GET'])
def get_fast_moving():
    """Get fast moving products"""
    try:
        limit = request.args.get('limit', 5, type=int)
        products = product_service.get_fast_moving_products(limit)
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/weekly-analysis', methods=['GET'])
def get_weekly_analysis():
    """Get weekly analysis"""
    try:
        analysis = transaction_service.get_weekly_analysis()
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500