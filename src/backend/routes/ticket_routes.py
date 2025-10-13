from flask import request, jsonify
from backend.db.crud import crud_ticket

def register_routes(app):
    @app.route('/tickets', methods=['GET'])
    def get_tickets():
        return jsonify(crud_ticket.get_all_tickets())

    @app.route('/tickets/<int:ticket_id>', methods=['GET'])
    def get_ticket(ticket_id):
        ticket = crud_ticket.get_ticket_by_id(ticket_id)
        if ticket:
            return jsonify(ticket)
        return jsonify({'error': 'Ticket not found'}), 404

    @app.route('/tickets', methods=['POST'])
    def add_ticket():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        ticket = crud_ticket.create_ticket(data)
        return jsonify({'message': 'Ticket created', 'ticket': ticket}), 201

    @app.route('/tickets/<int:ticket_id>', methods=['PUT'])
    def update_ticket(ticket_id):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing data'}), 400
        updated_ticket = crud_ticket.update_ticket(ticket_id, data)
        if not updated_ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        return jsonify({'message': 'Ticket updated', 'ticket': updated_ticket}), 200

    @app.route('/tickets/<int:ticket_id>', methods=['DELETE'])
    def remove_ticket(ticket_id):
        crud_ticket.delete_ticket(ticket_id)
        return jsonify({'message': 'Ticket deleted'})