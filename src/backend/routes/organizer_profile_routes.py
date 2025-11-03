from flask import Blueprint, request, jsonify
from crud import crud_organizer_profile
from utils.auth import require_auth
from utils.validators import validate_profile_data

organizer_profile_routes = Blueprint('organizer_profile', __name__)

@organizer_profile_routes.route('/api/organizer/profile', methods=['GET'])
@require_auth
def get_profile(current_user):
    """Get the current organizer's profile"""
    try:
        profile = crud_organizer_profile.get_profile(current_user.id)
        if not profile:
            return jsonify({
                'success': False,
                'message': 'Profile not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': profile.data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_profile_routes.route('/api/organizer/profile', methods=['POST', 'PUT'])
@require_auth
def upsert_profile(current_user):
    """Create or update organizer profile"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Validate incoming data
        validation_result = validate_profile_data(data)
        if not validation_result['valid']:
            return jsonify({
                'success': False,
                'message': validation_result['errors']
            }), 400

        # Check if profile exists
        profile = crud_organizer_profile.get_profile(current_user.id)
        
        if profile and request.method == 'POST':
            return jsonify({
                'success': False,
                'message': 'Profile already exists'
            }), 400

        if not profile:
            # Create new profile
            profile = crud_organizer_profile.create_profile(current_user.id, data)
        else:
            # Update existing profile
            profile = crud_organizer_profile.update_profile(current_user.id, data)

        return jsonify({
            'success': True,
            'data': profile.data
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@organizer_profile_routes.route('/api/organizer/profile', methods=['DELETE'])
@require_auth
def delete_profile(current_user):
    """Delete organizer profile"""
    try:
        success = crud_organizer_profile.delete_profile(current_user.id)
        if not success:
            return jsonify({
                'success': False,
                'message': 'Profile not found'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Profile deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500