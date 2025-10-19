from flask import request, jsonify
from db.crud import crud_organization_member

def register_routes(app):
    @app.route('/organization_members', methods=['GET'])
    def get_organization_members():
        members = crud_organization_member.get_all_organization_members()
        return jsonify(members)

    @app.route('/organization_members', methods=['POST'])
    def add_organization_member():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        member = crud_organization_member.create_organization_member(data)
        return jsonify({'message': 'Organization member created', 'member': member}), 201

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['GET'])
    def get_organization_member(organization_id, user_id):
        member = crud_organization_member.get_organization_member(organization_id, user_id)
        if member:
            return jsonify(member)
        return jsonify({'error': 'Organization member not found'}), 404

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['DELETE'])
    def remove_organization_member(organization_id, user_id):
        success = crud_organization_member.delete_organization_member(organization_id, user_id)
        if success:
            return jsonify({'message': 'Organization member deleted'})
        else:
            return jsonify({'error': 'Organization member not found'}), 404
    
    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['PUT'])
    def update_organization_member(organization_id, user_id):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400

        updated_member = crud_organization_member.update_organization_member(organization_id, user_id, data)
        if not updated_member:
            return jsonify({'error': 'Member not found'}), 404

        return jsonify({'message': 'Member updated', 'member': updated_member}), 200