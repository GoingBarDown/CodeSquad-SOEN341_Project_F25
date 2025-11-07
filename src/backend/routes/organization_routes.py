from flask import request, jsonify
from db.crud import crud_organization

def register_routes(app):
    @app.route('/organizations', methods=['GET'])
    def get_organizations():
        try:
            orgs = crud_organization.get_all_organizations()
            return jsonify(orgs), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organizations/<int:org_id>', methods=['GET'])
    def get_organization(org_id):
        try:
            org = crud_organization.get_organization(org_id)
            if org:
                return jsonify(org), 200
            return jsonify({'error': 'Organization not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organizations', methods=['POST'])
    def add_organization():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400
            
            org_id = crud_organization.create_organization(data)
            return jsonify({'message': 'Organization created', 'id': org_id}), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organizations/<int:org_id>', methods=['DELETE'])
    def remove_organization(org_id):
        try:
            deleted = crud_organization.delete_organization(org_id)
            if not deleted:
                return jsonify({'error': 'Organization not found'}), 404
            return jsonify({'message': 'Organization deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Event not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organizations/<int:org_id>', methods=['PUT'])
    def update_organization(org_id):
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400
            
            updated_org = crud_organization.update_organization(org_id, data)
            if not updated_org:
                return jsonify({'error': 'Organization not found'}), 404
            
            return jsonify({'error': 'Organization updated', 'organization': updated_org}), 200
        except ValueError:
            return jsonify({'error': 'Organization not found'}), 404
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500
