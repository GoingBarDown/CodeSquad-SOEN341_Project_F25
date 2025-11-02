from db.models import Ticket
from db import db

def get_all_tickets():
    try:
        tickets = db.session.query(Ticket).all()
        return [ticket.data for ticket in tickets]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch tickets: {e}")

def get_ticket_by_id(ticket_id):
    try:
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return None
        return ticket.data
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch ticket {ticket_id}: {e}")

def create_ticket(data):
    try:
        new_ticket = Ticket(**data)
        db.session.add(new_ticket)
        db.session.commit()
        return new_ticket.id
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create ticket: {e}")

def update_ticket(ticket_id, data):
    try:
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return None
        for key, value in data.items():
            if hasattr(ticket, key):
                setattr(ticket, key, value)
        db.session.commit()
        return ticket.data
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update ticket {ticket_id}: {e}")

def delete_ticket(ticket_id):
    try:
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return False
        db.session.delete(ticket)
        db.session.commit()
        return True
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to delete ticket {ticket_id}: {e}")
