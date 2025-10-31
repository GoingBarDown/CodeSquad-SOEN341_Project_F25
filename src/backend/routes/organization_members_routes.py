from flask import request, jsonify
from db.crud import crud_organization_member

def register_routes(app):
    @app.route('/organization_members', methods=['GET'])
    def get_organization_members():
        try:
            members = crud_organization_member.get_all_organization_members()
            return jsonify(members), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members', methods=['POST'])
    def add_organization_member():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400
            member = crud_organization_member.create_organization_member(data)
            return jsonify({'message': 'Organization member created', 'member': member}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['GET'])
    def get_organization_member(organization_id, user_id):
        try:
            member = crud_organization_member.get_organization_member(organization_id, user_id)
            return jsonify(member), 200
        except ValueError:
            return jsonify({'error': 'Organization member not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['DELETE'])
    def remove_organization_member(organization_id, user_id):
        try:
            crud_organization_member.delete_organization_member(organization_id, user_id)
            return jsonify({'message': 'Organization member deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Organization member not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['PUT'])
    def update_organization_member(organization_id, user_id):
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400
            updated_member = crud_organization_member.update_organization_member(organization_id, user_id, data)
            return jsonify({'message': 'Member updated', 'member': updated_member}), 200
        except ValueError:
            return jsonify({'error': 'Organization member not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
