from flask import request, jsonify
from db.crud import crud_ticket

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
