from flask import request, jsonify
from db.crud import crud_events, crud_ticket, crud_users

def register_routes(app):
    @app.route('/events', methods=['GET'])
    def get_events():
        try:
            events = crud_events.get_all_events()
            return jsonify(events), 200
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>', methods=['GET'])
    def get_event(event_id):
        try:
            event = crud_events.get_event_by_id(event_id)
            if not event:
                return jsonify({'error': 'Event not found'}), 404
            return jsonify(event), 200
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    
    @app.route('/events/<int:event_id>/attendance', methods=['GET'])
    def get_event_attendance(event_id):
        try:
            event = crud_events.get_event_by_id(event_id)
            if not event:
                return jsonify({'error': 'Event not found'}), 404

            tickets = crud_ticket.get_tickets_by_event(event_id)
            registered = len(tickets)
            checked_in = len([t for t in tickets if t.get('status') == 'checked-in'])

            return jsonify({
                'registered': registered,
                'checked_in': checked_in
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>/participants', methods=['GET'])
    def get_event_participants(event_id):
        try:
            event = crud_events.get_event_by_id(event_id)
            if not event:
                return jsonify({'error': 'Event not found'}), 404

            tickets = crud_ticket.get_tickets_by_event(event_id)
            participants = []

            for t in tickets:
                user = crud_users.get_user_by_id(t.get('attendee_id'))
                if user:
                    participants.append({
                        'name': user['username'],
                        'ticketId': str(t.get('id')),
                        'status': t.get('status')
                    })

            return jsonify(participants), 200
        except Exception as e:
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
        

        #  NEW ROUTE FOR STUDENT CALENDAR 
    @app.route('/student/<user_id>/events', methods=['GET'])
    def get_student_events(user_id):
        try:
            tickets = crud_ticket.get_tickets_by_user(user_id)
            events_data = []
            
            for ticket in tickets:
                event_id = ticket.get('event_id')
                event = crud_events.get_event_by_id(event_id)
                
                if event:
                    # --- ROBUST DATE HANDLING START ---
                    # Check if the dates exist before trying to format them
                    start_date = event.get('start_date')
                    end_date = event.get('end_date')

                    # Only call .isoformat() if the date is not None
                    start_iso = start_date.isoformat() if start_date else None
                    end_iso = end_date.isoformat() if end_date else None
                    # --- ROBUST DATE HANDLING END ---

                    events_data.append({
                        "id": str(event.get('id')),
                        "title": event.get('title'),
                        "start": start_iso,  # Use the safe variable
                        "end": end_iso,      # Use the safe variable
                        "allDay": False,
                        "location": event.get('location'),
                        "claimStatus": ticket.get('status', 'Claimed'),
                        "ticketId": str(ticket.get('id'))
                    })

            return jsonify(events_data), 200
        except Exception as e:
            # This will log the specific crash to your terminal
            print(f"ERROR in get_student_events: {e}") 
            return jsonify({'error': f"Failed to fetch calendar data: {e}"}), 500