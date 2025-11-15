from flask import request, jsonify
from db.crud import crud_organization_member

def register_routes(app):
    """Register all organization-member-related Flask routes.

    This function attaches routes for retrieving, creating, updating, and
    deleting organization membership relationships. Each route interacts with
    the CRUD layer to perform database operations tied to a user's association
    with an organization.

    Parameters: app (Flask): The Flask application instance where routes will be registered.
    """

    @app.route('/organization_members', methods=['GET'])
    def get_organization_members():
        """Retrieve all organization members.

        Returns: tuple:
                - A JSON list of organization member entries.
                - HTTP status:
                    * 200: Successfully retrieved all organization members.
                    * 500: An internal error occurred.
        """
        try:
            members = crud_organization_member.get_all_organization_members()
            return jsonify(members), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members', methods=['POST'])
    def add_organization_member():
        """Create a new organization member entry.

        Expected JSON fields depend on the schema for organization membership,
        typically including organization_id and user_id.

        Returns: tuple:
                - JSON message with created member data.
                - HTTP status:
                    * 201: Member successfully created.
                    * 400: Missing or invalid request data.
                    * 500: Internal error while creating the member entry.
        """
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
        """Retrieve a specific organization member by organization ID and user ID.

        Parameters: organization_id (int): The ID of the organization.
            user_id (int): The ID of the user within the organization.

        Returns: tuple:
                - JSON object of the organization member.
                - HTTP status:
                    * 200: Member found and returned.
                    * 404: Member does not exist.
                    * 500: Internal server error.
        """
        try:
            member = crud_organization_member.get_organization_member(organization_id, user_id)
            if member:
                return jsonify(member), 200
            return jsonify({'error': 'Organization member not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['DELETE'])
    def remove_organization_member(organization_id, user_id):
        """Delete an organization member entry.

        Parameters: organization_id (int): The ID of the organization.
            user_id (int): The ID of the user to remove from the organization.

        Returns: tuple:
                - JSON message indicating deletion success.
                - HTTP status:
                    * 200: Member deleted successfully.
                    * 404: Member not found.
                    * 500: Internal error occurred during deletion.
        """
        try:
            deleted = crud_organization_member.delete_organization_member(organization_id, user_id)
            if not deleted:
                return jsonify({'error': 'Organization member not found'}), 404

            return jsonify({'message': 'Organization member deleted'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organization_members/<int:organization_id>/<int:user_id>', methods=['PUT'])
    def update_organization_member(organization_id, user_id):
        """Update an existing organization member entry.

        Parameters: organization_id (int): The organization to update the member within.
            user_id (int): The user whose membership data should be updated.

        Expected JSON:
            Fields representing new membership data, depending on model fields.

        Returns: tuple:
                - JSON message with updated member data.
                - HTTP status:
                    * 200: Successfully updated organization member.
                    * 400: Missing data.
                    * 404: Member not found.
                    * 500: Internal update error.
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400

            updated_member = crud_organization_member.update_organization_member(
                organization_id, user_id, data
            )

            if not updated_member:
                return jsonify({'error': 'Organization member not found'}), 404
            
            return jsonify({'message': 'Member updated', 'member': updated_member}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
