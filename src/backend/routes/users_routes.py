from flask import request, jsonify
from db.crud import crud_users

def register_routes(app):
    """Register all user-related Flask routes.

    This function defines REST API endpoints for retrieving, creating,
    authenticating, updating, and deleting user records. All database
    interactions are handled in the CRUD layer.

    Parameters: app (Flask): The Flask application instance onto which routes will be registered.
    """

    @app.route('/users', methods=['GET'])
    def get_users():
        """Retrieve all users.

        Returns: tuple:
                - JSON list of user objects.
                - HTTP status:
                    * 200: Successfully retrieved users.
                    * 500: Internal server error.
        """
        try:
            users = crud_users.get_all_users()
            return jsonify(users), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        """Retrieve a user by ID.

        Parameters: user_id (int): The unique identifier of the user.

        Returns: tuple:
                - JSON representation of the user.
                - HTTP status:
                    * 200: User found.
                    * 404: User not found.
                    * 500: Internal server error.
        """
        try:
            user = crud_users.get_user_by_id(user_id)
            if user:
                return jsonify(user), 200
            return jsonify({'error': 'User not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users/auth', methods=['POST'])
    def auth_user():
        """Authenticate a user with username and password.

        Expected JSON:
            {
                "username": "<username>",
                "password": "<password>"
            }

        Returns: tuple:
                - JSON message and user data on successful authentication.
                - HTTP status:
                    * 200: Authentication successful.
                    * 400: Missing credentials.
                    * 401: Invalid username or password.
                    * 500: Internal authentication error.
        """
        try:
            data = request.get_json()
            if not data or "username" not in data or "password" not in data:
                return jsonify({'error': 'Missing credentials'}), 400

            username = data["username"]
            password = data["password"]

            user = crud_users.authenticate_user(username, password)
            if not user:
                return jsonify({'error': "Invalid username or password"}), 401

            return jsonify({'message': 'Authenticated', 'user': user}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users', methods=['POST'])
    def add_user():
        """Create a new user entry.

        Expected JSON fields depend on the User model, but typically include
        username, password, and role or profile details.

        Returns: tuple:
                - JSON containing success message and user ID.
                - HTTP status:
                    * 201: User successfully created.
                    * 400: Missing request data.
                    * 500: Internal creation error.
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400

            user_id = crud_users.create_user(data)
            return jsonify({'message': 'User created', 'id': user_id}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users/<int:user_id>', methods=['DELETE'])
    def remove_user(user_id):
        """Delete a user by ID.

        Parameters: user_id (int): The ID of the user to delete.

        Returns: tuple:
                - JSON message indicating deletion status.
                - HTTP status:
                    * 200: User successfully deleted.
                    * 404: User not found.
                    * 500: Internal deletion error.
        """
        try:
            deleted = crud_users.delete_user(user_id)
            if not deleted:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({'message': 'User deleted'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users/<int:user_id>', methods=['PUT'])
    def update_user(user_id):
        """Update an existing user.

        Parameters: user_id (int): The ID of the user to update.

        Expected JSON: Fields representing updated user data.

        Returns: tuple:
                - JSON message and updated user data.
                - HTTP status:
                    * 200: User updated successfully.
                    * 400: Missing request data.
                    * 404: User not found.
                    * 500: Internal update error.
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400

            updated_user = crud_users.update_user(user_id, data)
            if not updated_user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({'message': 'User updated', 'user': updated_user}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
