from flask import request, jsonify, send_file
from db.crud import crud_ticket, crud_users
import qrcode  
import io

def register_routes(app):
    """Register all ticket-related Flask routes.

    This function defines REST API endpoints for retrieving, creating,
    validating, updating, and deleting ticket records. It also provides
    a route for generating QR codes and a route for retrieving event
    details associated with a user's tickets. All database interactions
    are delegated to the CRUD layer.

    Parameters: app (Flask): The Flask application instance onto which routes will be registered.
    """

    @app.route('/tickets', methods=['GET'])
    def get_tickets():
        """Retrieve all tickets.

        Returns: tuple:
                - JSON list of ticket objects.
                - HTTP status:
                    * 200: Successfully retrieved all tickets.
                    * 500: Internal server error.
        """
        try:
            tickets = crud_ticket.get_all_tickets()
            return jsonify(tickets), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/<int:ticket_id>', methods=['GET'])
    def get_ticket(ticket_id):
        """Retrieve a single ticket by its ID.

        Parameters: ticket_id (int): The unique identifier of the ticket.

        Returns: tuple:
                - JSON representation of the ticket.
                - HTTP status:
                    * 200: Ticket found.
                    * 404: Ticket not found.
                    * 500: Internal server error.
        """
        try:
            ticket = crud_ticket.get_ticket_by_id(ticket_id)
            if ticket:
                return jsonify(ticket), 200
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    @app.route('/api/student/<int:student_id>/tickets-with-details', methods=['GET'])
    def get_student_tickets_with_details(student_id):
        """Retrieve all tickets for a specific student along with their event details.

        Parameters: student_id (int): The ID of the student whose ticket details are requested.

        Returns: tuple:
                - JSON list containing ticket and event details.
                - HTTP status:
                    * 200: Successfully retrieved data.
                    * 500: Error retrieving ticket details.
        """
        try:
            tickets_with_details = crud_ticket.get_tickets_and_events_for_user(student_id)

            if tickets_with_details is None:
                return jsonify({'error': 'Failed to retrieve ticket details'}), 500

            return jsonify(tickets_with_details), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/<int:ticket_id>/qr', methods=['GET'])
    def get_ticket_qr(ticket_id):
        """Generate and return a QR code associated with a ticket ID.

        Parameters: ticket_id (int): The ID encoded into the generated QR code.

        Returns:
            - PNG image file containing the ticket QR code.
            - HTTP status:
                * 200: QR code successfully generated.
                * 500: Error generating QR code.
        """
        try:
            qr_data = str(ticket_id)
            img = qrcode.make(qr_data)
            buf = io.BytesIO()
            img.save(buf, "PNG")
            buf.seek(0)
            return send_file(buf, mimetype='image/png')
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets', methods=['POST'])
    def add_ticket():
        """Create a new ticket entry.

        Expected JSON fields depend on the Ticket model but typically include
        attendee ID, event ID, and optional metadata.

        Returns: tuple:
                - JSON containing success message and created ticket data.
                - HTTP status:
                    * 201: Ticket successfully created.
                    * 400: Missing or invalid request data.
                    * 500: Internal creation error.
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400

            ticket = crud_ticket.create_ticket(data)
            return jsonify({'message': 'Ticket created', 'ticket': ticket}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/validate', methods=['POST'])
    def validate_ticket():
        """Validate and check in a ticket.

        Expected JSON:
            {
                "ticketId": "<ticket ID as string>"
            }

        Validation rules:
            - Ticket must exist.
            - Ticket must have status 'valid'.
            - Ticket must not already be checked in.

        On success, the ticket status is updated to 'checked-in'
        and attendee information is returned.

        Returns: tuple:
                - JSON indicating validation result, attendee name, and updated ticket.
                - HTTP status:
                    * 200: Ticket successfully validated.
                    * 400: Missing or invalid ticket ID, or invalid ticket status.
                    * 404: Ticket not found.
                    * 500: Internal validation error.
        """
        try:
            data = request.get_json()
            ticket_id_str = data.get('ticketId') if data else None

            if not ticket_id_str:
                return jsonify({'error': 'Ticket ID required'}), 400

            try:
                ticket_id = int(ticket_id_str)
            except ValueError:
                return jsonify({'error': 'Invalid Ticket ID format'}), 400

            ticket = crud_ticket.get_ticket_by_id(ticket_id)
            if not ticket:
                return jsonify({'valid': False, 'error': 'Ticket not found'}), 404

            if ticket.get('status') == 'checked-in':
                return jsonify({'valid': False, 'error': 'Ticket already checked in'}), 400

            if ticket.get('status') != 'valid':
                return jsonify({'valid': False, 'error': f"Invalid ticket status: {ticket.get('status')}"}), 400

            updated_ticket = crud_ticket.update_ticket(ticket_id, {'status': 'checked-in'})

            user = crud_users.get_user_by_id(ticket.get('attendee_id'))
            return jsonify({
                'valid': True,
                'message': 'Ticket Checked In Successfully!',
                'attendeeName': user['username'] if user else 'Unknown',
                'ticket': updated_ticket
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/<int:ticket_id>', methods=['PUT'])
    def update_ticket(ticket_id):
        """Update an existing ticket.

        Parameters: ticket_id (int): The ID of the ticket to update.

        Expected JSON: Fields representing updated ticket data.

        Returns: tuple:
                - JSON message with updated ticket data.
                - HTTP status:
                    * 200: Ticket updated successfully.
                    * 400: Missing request body.
                    * 404: Ticket not found.
                    * 500: Internal update error.
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Missing data'}), 400
            
            updated_ticket = crud_ticket.update_ticket(ticket_id, data)
            if not updated_ticket:
                return jsonify({'error': 'Ticket not found'}), 404

            return jsonify({'message': 'Ticket updated', 'ticket': updated_ticket}), 200
        except ValueError:
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/<int:ticket_id>', methods=['DELETE'])
    def remove_ticket(ticket_id):
        """Delete a ticket by ID.

        Parameters: ticket_id (int): The ID of the ticket to delete.

        Returns: tuple:
                - JSON message indicating deletion status.
                - HTTP status:
                    * 200: Ticket successfully deleted.
                    * 404: Ticket not found.
                    * 500: Internal deletion error.
        """
        try:
            deleted = crud_ticket.delete_ticket(ticket_id)
            if not deleted:
                return jsonify({'error': 'Ticket not found'}), 404

            return jsonify({'message': 'Ticket deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
