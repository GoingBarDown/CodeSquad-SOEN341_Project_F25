from flask import request, jsonify
from db import events_crud

def register_routes(app):
    @app.route('/events', methods=['GET'])
    def get_events():
        return jsonify(events_crud.get_all_events())

    @app.route('/events/<int:event_id>', methods=['GET'])
    def get_event(event_id):
        event = events_crud.get_event_by_id(event_id)
        if event:
            return jsonify(event)
        return jsonify({'error': 'Event not found'}), 404

    @app.route('/events', methods=['POST'])
    def add_event():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        event_id = events_crud.create_event(data['title'])
        return jsonify({'message': 'Event created', 'id': event_id}), 201

    @app.route('/events/<int:event_id>', methods=['DELETE'])
    def remove_event(event_id):
        events_crud.delete_event(event_id)
        return jsonify({'message': 'Event deleted'})