from db.models import Ticket
from db import db

def get_all_tickets():
    tickets = Ticket.query.all()
    return [ticket.data for ticket in tickets]

def get_ticket_by_id(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    return ticket.data if ticket else None

def create_ticket(data):
    new_ticket = Ticket(**data)
    db.session.add(new_ticket)
    db.session.commit()
    return new_ticket.id  # Or new_ticket.data for the full dict

def update_ticket(ticket_id, data):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return None
    for key, value in data.items():
        if hasattr(ticket, key):
            setattr(ticket, key, value)
    db.session.commit()
    return ticket.data

def delete_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        db.session.delete(ticket)
        db.session.commit()
        return True
    else:
        return False
    
def get_tickets_by_event(event_id):
    tickets = Ticket.query.filter_by(event_id=event_id).all()
    return [ticket.data for ticket in tickets]