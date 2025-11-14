from flask import request, jsonify
from db.crud import crud_events, crud_ticket, crud_users

def register_routes(app):
    """Register all event-related Flask routes for the application.

    This function attaches multiple endpoints to the provided Flask app instance.
    The routes support event retrieval, creation, updating, deletion, participant
    listing, attendance statistics, and fetching events associated with a specific
    student user.

    Parameters: app (Flask): The Flask application instance where routes will be registered.
    """

    @app.route('/events', methods=['GET'])
    def get_events():
        """Retrieve all events stored in the system.

        Returns: tuple: A JSON list of events and a status code.
                - 200: Successfully retrieved all events.
                - 500: An error occurred while fetching events.
        """
        try:
            events = crud_events.get_all_events()
            return jsonify(events), 200
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>', methods=['GET'])
    def get_event(event_id):
        """Retrieve a single event by its unique identifier.

        Parameters: event_id (int): The ID of the event to retrieve.

        Returns: tuple: A JSON object of the event data and a status code.
                - 200: Event found and returned.
                - 404: Event does not exist.
                - 500: Internal error occurred while fetching the event.
        """
        try:
            event = crud_events.get_event_by_id(event_id)
            if not event:
                return jsonify({'error': 'Event not found'}), 404
            return jsonify(event), 200
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/events/<int:event_id>/attendance', methods=['GET'])
    def get_event_attendance(event_id):
        """Retrieve attendance statistics for a specific event.

        Parameters: event_id (int): The ID of the event whose attendance is requested.

        Returns: tuple: 
                - JSON object containing:
                    * registered (int): Total number of tickets issued.
                    * checked_in (int): Number of attendees marked as checked-in.
                - HTTP status code:
                    * 200: Successfully computed attendance statistics.
                    * 404: Event not found.
                    * 500: An unexpected error occurred.
        """
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
        """Retrieve a list of participants for a specified event.

        Parameters: event_id (int): The ID of the event to fetch participants for.

        Returns: tuple:
                - A list of participant dictionaries containing:
                    * name (str): Username of the attendee.
                    * ticketId (str): Ticket identifier.
                    * status (str): Ticket status.
                - HTTP status:
                    * 200: Successfully retrieved participant list.
                    * 404: Event does not exist.
                    * 500: An unexpected error occurred.
        """
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
        """Create a new event.

        Expected JSON fields depend on the event model defined in the database.

        Returns: tuple:
                - JSON message with created event data.
                - HTTP status:
                    * 201: Event successfully created.
                    * 400: Missing or invalid data.
                    * 500: Internal error while creating event.
        """
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
        """Update an existing event.

        Parameters: event_id (int): ID of the event to update.

        Returns: tuple:
                - JSON message with updated event data.
                - HTTP status:
                    * 200: Successfully updated event.
                    * 400: Missing data.
                    * 404: Event does not exist.
                    * 500: Internal update error.
        """
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
        """Delete an event from the system.

        Parameters: event_id (int): ID of the event to delete.

        Returns: tuple:
                - JSON message about deletion.
                - HTTP status:
                    * 200: Event successfully deleted.
                    * 404: Event not found.
                    * 500: Internal deletion error.
        """
        try:
            deleted = crud_events.delete_event(event_id)
            if not deleted:
                return jsonify({'error': 'Event not found'}), 404
            return jsonify({'message': 'Event deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Event not found'}), 404
        except RuntimeError as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/student/<user_id>/events', methods=['GET'])
    def get_student_events(user_id):
        """Retrieve all events associated with a particular student user.

        Parameters: user_id (str): The ID of the user whose events should be returned.

        Returns: tuple:
                - A list of event dictionaries formatted for display in a calendar UI, including:
                    * id (str): Event ID.
                    * title (str): Event title.
                    * start (str): ISO-formatted start date.
                    * end (str): ISO-formatted end date.
                    * allDay (bool): Always False.
                    * location (str): Event location.
                    * claimStatus (str): Status of the user's ticket.
                    * ticketId (str): Ticket ID.
                - HTTP status:
                    * 200: Successfully retrieved user events.
                    * 500: An error occurred while fetching event data.
        """
        try:
            tickets = crud_ticket.get_tickets_by_user(user_id)
            if not tickets:
                return jsonify([]), 200
            
            events_data = []

            for ticket in tickets:
                event_id = ticket.get('event_id')
                event = crud_events.get_event_by_id(event_id)
                if event:
                    start_date = event.get('start_date')
                    end_date = event.get('end_date')

                    start_iso = start_date.isoformat() if start_date else None
                    end_iso = end_date.isoformat() if end_date else None

                    events_data.append({
                        "id": str(event.get('id')),
                        "title": event.get('title'),
                        "start": start_iso,
                        "end": end_iso,
                        "allDay": False,
                        "location": event.get('location'),
                        "claimStatus": ticket.get('status', 'Claimed'),
                        "ticketId": str(ticket.get('id'))
                    })

            return jsonify(events_data), 200

        except Exception as e:
            return jsonify({'error': f"Failed to fetch calendar data: {e}"}), 500
