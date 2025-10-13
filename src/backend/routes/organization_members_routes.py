from flask import request, jsonify
from backend.db.crud.crud_organization_member import (
    create_organization_member,
    get_organization_member,
    delete_organization_member
)

def register_routes(app):
    @app.route('/organization_members', methods=['POST'])
    def add_organization_member():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        create_organization_member(data['organization_id'], data['user_id'])
        return jsonify({"message": "Organization member added"}), 201

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['GET'])
    def fetch_organization_member(organization_id, user_id):
        member = get_organization_member(organization_id, user_id)
        if member:
            return jsonify(member)
        return jsonify({"error": "Member not found"}), 404

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['DELETE'])
    def remove_organization_member(organization_id, user_id):
        delete_organization_member(organization_id, user_id)
        return jsonify({"message": "Organization member deleted"})