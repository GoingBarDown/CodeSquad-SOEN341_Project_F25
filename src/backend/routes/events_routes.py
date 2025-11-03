from flask import request, jsonify
from db.crud import crud_events, crud_ticket, crud_users

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
    
    @app.route('/events/<int:event_id>/attendance', methods=['GET'])
    def get_event_attendance(event_id):
        event = crud_events.get_event_by_id(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404

        tickets = crud_ticket.get_tickets_by_event(event_id)
        registered = len(tickets)
        checked_in = len([t for t in tickets if t.status == 'checked-in'])

        return jsonify({
            'registered': registered,
            'checked_in': checked_in
        })

    @app.route('/events/<int:event_id>/participants', methods=['GET'])
    def get_event_participants(event_id):
        event = crud_events.get_event_by_id(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404

        tickets = crud_ticket.get_tickets_by_event(event_id)
        participants = []

        for ticket in tickets:
            user = crud_users.get_user_by_id(ticket.attendee_id)
            if user:
                participants.append({
                    'name': user.username,
                    'ticketId': str(ticket.id),
                    'status': ticket.status
                })

        return jsonify(participants)

    @app.route('/tickets/validate', methods=['POST'])
    def validate_ticket():
        data = request.get_json()
        ticket_id = data.get('ticketId')

        if not ticket_id:
            return jsonify({'error': 'Ticket ID required'}), 400

        ticket = crud_ticket.get_ticket_by_id(int(ticket_id))
        if not ticket:
            return jsonify({'valid': False})

        user = crud_users.get_user_by_id(ticket.attendee_id)
        return jsonify({
            'valid': True,
            'attendeeName': user.username if user else 'Unknown'
        })