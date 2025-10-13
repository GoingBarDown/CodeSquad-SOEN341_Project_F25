from flask import Blueprint, request, jsonify
from backend.db.crud.crud_organization import (
    create_organization,
    get_organization,
    update_organization,
    delete_organization
)

organization_bp = Blueprint('organization_bp', __name__)

@organization_bp.route('/organizations', methods=['POST'])
def add_organization():
    data = request.get_json()
    org_id = create_organization(data['title'], data.get('description'), data.get('status'))
    return jsonify({"message": "Organization added", "organization_id": org_id}), 201

@organization_bp.route('/organizations/<int:org_id>', methods=['GET'])
def fetch_organization(org_id):
    org = get_organization(org_id)
    if org:
        return jsonify(org)
    return jsonify({"error": "Organization not found"}), 404

@organization_bp.route('/organizations/<int:org_id>', methods=['PUT'])
def update_organization_route(org_id):
    data = request.get_json()
    update_organization(org_id, data['title'], data.get('description'), data.get('status'))
    return jsonify({"message": "Organization updated"})

@organization_bp.route('/organizations/<int:org_id>', methods=['DELETE'])
def remove_organization(org_id):
    delete_organization(org_id)
    return jsonify({"message": "Organization deleted"})