from flask import request, jsonify
from backend.db.crud import crud_events

def register_routes(app):
    @app.route('/events', methods=['GET'])
    def get_events():
        return jsonify(crud_events.get_all_events())

    @app.route('/events/<int:event_id>', methods=['GET'])
    def get_event(event_id):
        event = crud_events.get_event_by_id(event_id)
        if event:
            return jsonify(event)
        return jsonify({'error': 'Event not found'}), 404

    @app.route('/events', methods=['POST'])
    def add_event():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        event = crud_events.create_event(data)
        return jsonify({'message': 'Event created', 'event': event}), 201


    @app.route('/events/<int:event_id>', methods=['PUT'])
    def update_event(event_id):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        updated_event = crud_events.update_event(event_id, data)
        if not updated_event:
            return jsonify({'error': 'Event not found'}), 404
        return jsonify({'message': 'Event updated', 'event': updated_event}), 200

    @app.route('/events/<int:event_id>', methods=['DELETE'])
    def remove_event(event_id):
        crud_events.delete_event(event_id)
        return jsonify({'message': 'Event deleted'})