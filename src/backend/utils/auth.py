from functools import wraps
from flask import request, jsonify
import jwt
from db.models import User

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check if token is in headers
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token format'
                }), 401

        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401

        try:
            # Replace this with your actual secret key from config
            data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                raise Exception('User not found')
                
            # For organizer routes, check if user is an organizer
            if current_user.role != 'organizer':
                return jsonify({
                    'success': False,
                    'message': 'Unauthorized. Organizer access required.'
                }), 403

        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
        except Exception as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 401

        # Pass the current_user to the route
        return f(current_user=current_user, *args, **kwargs)

    return decorated