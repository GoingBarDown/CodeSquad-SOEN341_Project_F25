from flask import request, jsonify
from db.crud import crud_organization

def register_routes(app):
    """Register all organization-related Flask routes.

    This function defines REST API endpoints for retrieving, creating,
    updating, and deleting organization records. All database interactions
    are delegated to the CRUD layer.

    Parameters: app (Flask): The Flask application instance onto which routes will be registered.
    """

    @app.route('/organizations', methods=['GET'])
    def get_organizations():
        """Retrieve all organizations.

        Returns: tuple:
                - JSON list of organization objects.
                - HTTP status:
                    * 200: Successfully retrieved all organizations.
                    * 500: An internal server error occurred.
        """
        try:
            orgs = crud_organization.get_all_organizations()
            return jsonify(orgs), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organizations/<int:org_id>', methods=['GET'])
    def get_organization(org_id):
        """Retrieve a single organization by its ID.

        Parameters: org_id (int): The unique identifier of the organization.

        Returns: tuple:
                - JSON representation of the organization.
                - HTTP status:
                    * 200: Organization found.
                    * 404: Organization not found.
                    * 500: Internal server error.
        """
        try:
            org = crud_organization.get_organization(org_id)
            if org:
                return jsonify(org), 200
            return jsonify({'error': 'Organization not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/organizations', methods=['POST'])
    def add_organization():
        """Create a new organization entry.

        Expected JSON fields vary depending on the Organization model,
        but typically include organization name and related attributes.

        Returns: tuple:
                - JSON containing a success message and newly created organization ID.
                - HTTP status:
                    * 201: Organization successfully created.
                    * 400: Missing or invalid request data.
                    * 500: Internal error during creation.
        """
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
        """Delete an organization by ID.

        Parameters: org_id (int): The ID of the organization to delete.

        Returns: tuple:
                - JSON message indicating deletion result.
                - HTTP status:
                    * 200: Organization successfully deleted.
                    * 404: Organization not found.
                    * 500: Internal deletion error.
        """
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
        """Update an existing organization.

        Parameters: org_id (int): The ID of the organization to update.

        Expected JSON: Fields representing the new organization data.

        Returns: tuple:
                - JSON message containing updated organization data.
                - HTTP status:
                    * 200: Organization updated.
                    * 400: Missing request body.
                    * 404: Organization not found.
                    * 500: Internal update error.
        """
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
