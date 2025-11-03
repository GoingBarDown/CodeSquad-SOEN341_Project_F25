from flask import request, jsonify
from db.crud import crud_ticket, crud_users

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
            return jsonify(ticket), 200
        except ValueError:
            return jsonify({'error': 'Ticket not found'}), 404
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
            ticket_id = data.get('ticketId') if data else None

            if not ticket_id:
                return jsonify({'error': 'Ticket ID required'}), 400

            ticket = crud_ticket.get_ticket_by_id(int(ticket_id))
            if not ticket:
                return jsonify({'valid': False}), 200

            user = crud_users.get_user_by_id(ticket.get('attendee_id'))
            return jsonify({
                'valid': True,
                'attendeeName': user['username'] if user else 'Unknown'
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
            return jsonify({'message': 'Ticket updated', 'ticket': updated_ticket}), 200
        except ValueError:
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/tickets/<int:ticket_id>', methods=['DELETE'])
    def remove_ticket(ticket_id):
        try:
            crud_ticket.delete_ticket(ticket_id)
            return jsonify({'message': 'Ticket deleted'}), 200
        except ValueError:
            return jsonify({'error': 'Ticket not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
