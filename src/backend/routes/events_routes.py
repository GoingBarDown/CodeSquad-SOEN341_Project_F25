from flask import request, jsonify
from db.crud import crud_events, crud_ticket, crud_users

def register_routes(app):
    @app.route('/events', methods=['GET'])
    def get_events():
        try:
            events = crud_events.get_all_events()
            return jsonify(events)
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>', methods=['GET'])
    def get_event(event_id):
        try:
            event = crud_events.get_event_by_id(event_id)
            return jsonify(event)
        except ValueError:
            return jsonify({'error': 'Event not found'}), 404
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events', methods=['POST'])
    def add_event():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        try:
            event = crud_events.create_event(data)
            return jsonify({'message': 'Event created', 'event': event}), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>', methods=['PUT'])
    def update_event(event_id):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        try:
            updated_event = crud_events.update_event(event_id, data)
            if not updated_event:
                return jsonify({'error': 'Event not found'}), 404
            return jsonify({'message': 'Event updated', 'event': updated_event}), 200
        except ValueError:
            return jsonify({'error': 'Event not found'}), 404
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>', methods=['DELETE'])
    def remove_event(event_id):
        try:
            deleted = crud_events.delete_event(event_id)
            if not deleted:
                return jsonify({'error': 'Event not found'}), 404
            return jsonify({'message': 'Event deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Event not found'}), 404
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500
