from flask import request, jsonify, send_file
from db.crud import crud_ticket, crud_users
import qrcode  
import io

def register_routes(app):
    @app.route('/tickets', methods=['GET'])
    def get_tickets():
        try:
            tickets = crud_ticket.get_all_tickets()
            return jsonify(tickets), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/<int:ticket_id>', methods=['GET'])
    def get_ticket(ticket_id):
        try:
            ticket = crud_ticket.get_ticket_by_id(ticket_id)
            if ticket:
                return jsonify(ticket), 200
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    @app.route('/api/student/<int:student_id>/tickets-with-details', methods=['GET'])
    def get_student_tickets_with_details(student_id):
        """
        API endpoint to get all tickets and their event details for a 
        specific student.
        """
        try:
            # This calls the new function we just made in crud_ticket.py
            tickets_with_details = crud_ticket.get_tickets_and_events_for_user(student_id)

            if tickets_with_details is None:
                # This handles the error case from the crud function
                return jsonify({'error': 'Failed to retrieve ticket details'}), 500

            return jsonify(tickets_with_details), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # This route generates and returns the QR code image for a ticket
    @app.route('/tickets/<int:ticket_id>/qr', methods=['GET'])
    def get_ticket_qr(ticket_id):
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
        try:
            data = request.get_json()
            ticket_id_str = data.get('ticketId') if data else None

            if not ticket_id_str:
                return jsonify({'error': 'Ticket ID required'}), 400

            try:
                ticket_id = int(ticket_id_str)
            except ValueError:
                return jsonify({'error': 'Invalid Ticket ID format'}), 400

            # 1. Find the ticket
            ticket = crud_ticket.get_ticket_by_id(ticket_id)
            if not ticket:
                # Use 404 for not found
                return jsonify({'valid': False, 'error': 'Ticket not found'}), 404

            # 2. Check its status
            if ticket.get('status') == 'checked-in':
                return jsonify({'valid': False, 'error': 'Ticket already checked in'}), 400

            if ticket.get('status') != 'valid':
                return jsonify({'valid': False, 'error': f"Invalid ticket status: {ticket.get('status')}"}), 400

            # 3. Update status to 'checked-in'
            # We assume update_ticket takes an ID and a dict of fields to update
            updated_ticket = crud_ticket.update_ticket(ticket_id, {'status': 'checked-in'})

            # 4. Get attendee name for a nice success message

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
        try:
            deleted = crud_ticket.delete_ticket(ticket_id)
            if not deleted:
                return jsonify({'error': 'Ticket not found'}), 404
            return jsonify({'message': 'Ticket deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
