from flask import request, jsonify
from backend.db.crud import crud_users

def register_routes(app):
    @app.route('/users', methods=['GET'])
    def get_users():
        return jsonify(crud_users.get_all_users())

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        user = crud_users.get_user_by_id(user_id)
        if user:
            return jsonify(user)
        return jsonify({'error': 'User not found'}), 404

    @app.route('/users', methods=['POST'])
    def add_user():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        user_id = crud_users.create_user(data)
        return jsonify({'message': 'User created', 'id': user_id}), 201

    @app.route('/users/<int:user_id>', methods=['DELETE'])
    def remove_user(user_id):
        crud_users.delete_user(user_id)
        return jsonify({'message': 'User deleted'})
    
    @app.route('/users/<int:user_id>', methods=['PUT'])
    def update_user(user_id):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400

        updated_user = crud_users.update_user(user_id, data)
        if not updated_user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'message': 'User updated', 'user': updated_user}), 200