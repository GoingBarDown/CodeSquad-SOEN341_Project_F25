from flask import request, jsonify
from db.crud import crud_users

def register_routes(app):
    @app.route('/users', methods=['GET'])
    def get_users():
        try:
            users = crud_users.get_all_users()
            return jsonify(users), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        try:
            user = crud_users.get_user_by_id(user_id)
            if user:
                return jsonify(user), 200
            return jsonify({'error': 'User not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users', methods=['POST'])
    def add_user():
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
        try:
            deleted = crud_users.delete_user(user_id)
            if not deleted:
                return jsonify({'error': 'User not found'}), 404
            return jsonify({'message': 'User deleted'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/users/<int:user_id>', methods=['PUT'])
    def update_user(user_id):
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
