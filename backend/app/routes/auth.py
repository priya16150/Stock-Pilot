from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.models.user import UserCreate, UserLogin

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize auth service with database
auth_service = AuthService()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_data = UserCreate(data)
        
        if not user_data.email or not user_data.password or not user_data.username:
            return jsonify({'error': 'Email, username and password are required'}), 400
        
        user = auth_service.create_user(user_data)
        if not user:
            return jsonify({'error': 'User already exists'}), 400
        
        return jsonify({
            'message': 'User created successfully',
            'id': str(user['_id']),
            'email': user['email'],
            'username': user['username'],
            'full_name': user.get('full_name', '')
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = auth_service.authenticate_user(email, password)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        token = auth_service.generate_token(user['_id'], user['email'])
        
        return jsonify({
            'access_token': token,
            'token_type': 'bearer',
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'username': user['username'],
                'full_name': user.get('full_name', ''),
                'role': user.get('role', 'user')
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user info"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        payload = auth_service.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = auth_service.get_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': str(user['_id']),
            'email': user.get('email', ''),
            'username': user.get('username', ''),
            'full_name': user.get('full_name', ''),
            'role': user.get('role', 'user'),
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        payload = auth_service.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        allowed_fields = ['full_name', 'username', 'email']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # update_user returns True if matched (even if nothing changed)
        auth_service.update_user(payload['user_id'], update_data)
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        payload = auth_service.verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Missing required fields'}), 400
        
        if auth_service.change_password(payload['user_id'], current_password, new_password):
            return jsonify({'message': 'Password changed successfully'}), 200
        return jsonify({'error': 'Invalid current password'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500