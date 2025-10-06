from flask import request, jsonify
from db import users_crud

def register_routes(app):
    @app.route('/users', methods=['GET'])
    def get_users():
        return jsonify(users_crud.get_all_users())

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        user = users_crud.get_user_by_id(user_id)
        if user:
            return jsonify(user)
        return jsonify({'error': 'User not found'}), 404

    @app.route('/users', methods=['POST'])
    def add_user():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        user_id = users_crud.create_user(data['username'], data['password'], data['email'])
        return jsonify({'message': 'User created', 'id': user_id}), 201

    @app.route('/users/<int:user_id>', methods=['DELETE'])
    def remove_user(user_id):
        users_crud.delete_user(user_id)
        return jsonify({'message': 'User deleted'})