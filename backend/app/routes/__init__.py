"""
Routes Module
Contains all API route blueprints
"""

from app.routes.auth import auth_bp
from app.routes.products import products_bp
from app.routes.inventory import inventory_bp
from app.routes.transactions import transactions_bp
from app.routes.dashboard import dashboard_bp

__all__ = [
    'auth_bp',
    'products_bp',
    'inventory_bp',
    'transactions_bp',
    'dashboard_bp'
]