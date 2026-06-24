from flask import Blueprint, request, jsonify
from app.services.transaction_service import TransactionService

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')
transaction_service = TransactionService()

@transactions_bp.route('/', methods=['POST'], strict_slashes=False)
def create_transaction():
    """Create a new transaction"""
    try:
        data = request.json
        print("Incoming transaction data:", data)
        transaction = transaction_service.create_transaction(data)
        if not transaction:
            return jsonify({'error': 'Transaction failed'}), 400
        if 'error' in transaction:
            return jsonify(transaction), 400
        return jsonify(transaction), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/', methods=['GET'], strict_slashes=False)
def get_transactions():
    """Get recent transactions"""
    try:
        limit = request.args.get('limit', 100, type=int)
        transactions = transaction_service.get_transactions(limit)
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Get transaction by ID"""
    try:
        transaction = transaction_service.get_transaction_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        return jsonify(transaction), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500