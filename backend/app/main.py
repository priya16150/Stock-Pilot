import sys
import os
# Allow running `python app/main.py` directly from the backend folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Load .env
load_dotenv()

from app.config.database import init_db, get_db
from app.routes.auth import auth_bp
from app.routes.products import products_bp
from app.routes.inventory import inventory_bp
from app.routes.transactions import transactions_bp
from app.routes.dashboard import dashboard_bp
from app.routes.ai_routes import ai_bp
from app.routes.suppliers import suppliers_bp

def create_app():
    """Create and configure Flask app"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret')
    
    # Initialize extensions
    CORS(app, cors_allowed_origins="*")
    jwt = JWTManager(app)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(suppliers_bp)
    
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to StockPilot API',
            'version': '1.0.0',
            'status': 'running'
        })
    
    @app.route('/health')
    def health():
        try:
            db = get_db()
            if db is not None:
                db.command('ping')
                return jsonify({
                    'status': 'healthy',
                    'database': 'connected'
                })
            else:
                return jsonify({
                    'status': 'error',
                    'database': 'disconnected'
                }), 500
        except Exception as e:
            return jsonify({
                'status': 'error',
                'database': 'disconnected',
                'error': str(e)
            }), 500
    
    return app

# Expose app globally for Gunicorn
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)