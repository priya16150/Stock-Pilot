"""
StockPilot Backend Application
Flask-based REST API for Supermarket Management System
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from app.config.database import init_db
from app.routes.auth import auth_bp
from app.routes.products import products_bp
from app.routes.inventory import inventory_bp
from app.routes.transactions import transactions_bp
from app.routes.dashboard import dashboard_bp

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    
    # Initialize extensions
    CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
    jwt = JWTManager(app)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(dashboard_bp)
    
    @app.route('/')
    def index():
        return {
            'message': 'Welcome to StockPilot API',
            'version': '1.0.0',
            'status': 'running'
        }
    
    @app.route('/health')
    def health():
        return {
            'status': 'healthy',
            'database': 'connected'
        }
    
    return app

# For running directly
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=8000)