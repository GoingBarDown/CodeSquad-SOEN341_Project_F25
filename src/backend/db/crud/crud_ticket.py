from db.models import Ticket, Event
from db import db

def get_all_tickets():
    """
    Retrieve all ticket records from the database and return their serialized data dictionaries.

    Parameters: None

    Returns: list: A list of dictionaries, each representing a ticket.
    """
    try:
        tickets = db.session.query(Ticket).all()
        return [ticket.data for ticket in tickets]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch tickets: {e}")

def get_tickets_and_events_for_user(student_id):
    """
    Retrieve all tickets associated with a specific student and join them with their related event information.

    Parameters: student_id (int): The ID of the student whose tickets and events should be fetched.

    Returns: list: A list of dictionaries where each entry contains ticket details and its corresponding event information.
    """
    try:
        results = (
            db.session.query(Ticket, Event)
            .join(Event, Ticket.event_id == Event.id)
            .filter(Ticket.attendee_id == student_id)
            .all()
        )

        tickets_list = []
        for ticket, event in results:
            tickets_list.append({
                "ticket_id": ticket.id,
                "ticket_status": ticket.status,
                "event_id": event.id,
                "event_title": event.title,
                "event_date": event.start_date.isoformat() if event.start_date else None,
                "event_location": event.location
            })

        return tickets_list

    except Exception as e:
        print(f"Error fetching tickets with details: {e}")
        db.session.rollback()
        return []

def get_ticket_by_id(ticket_id):
    """
    Retrieve a single ticket by its ID.

    Parameters: ticket_id (int): The ID of the ticket to retrieve.

    Returns: dict or None: Serialized ticket data if found; otherwise None.
    """
    try:
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return None
        return ticket.data
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch ticket {ticket_id}: {e}")

def get_tickets_by_user(user_id):
    """
    Retrieve all tickets associated with a given user.

    Parameters: user_id (int): The ID of the user whose tickets should be fetched.

    Returns: list: A list of dictionaries representing the user's tickets.
    """
    try:
        tickets = db.session.query(Ticket).filter_by(attendee_id=user_id).all()
        return [ticket.data for ticket in tickets]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch tickets for user {user_id}: {e}")

def get_tickets_by_event(event_id):
    """
    Retrieve all tickets associated with a specific event.

    Parameters: event_id (int): The ID of the event whose tickets should be fetched.

    Returns: list: A list of dictionaries representing tickets for the event.
    """
    try:
        tickets = db.session.query(Ticket).filter_by(event_id=event_id).all()
        return [ticket.data for ticket in tickets]
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch tickets for event {event_id}: {e}")

def create_ticket(data):
    """
    Create a new ticket using the provided field data.

    Parameters: data (dict): A dictionary containing the fields required to create a Ticket.

    Returns: int: The ID of the newly created ticket.
    """
    try:
        new_ticket = Ticket(**data)
        db.session.add(new_ticket)
        db.session.commit()
        return new_ticket.id
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create ticket: {e}")

def update_ticket(ticket_id, data):
    """
    Update an existing ticket with new values.

    Parameters: ticket_id (int): The ID of the ticket to update.
    data (dict): A dictionary of fields to update on the ticket.

    Returns: dict or None: The updated serialized ticket data if the ticket exists; otherwise None.
    """
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
    """
    Delete a ticket from the database.

    Parameters: ticket_id (int): The ID of the ticket to delete.

    Returns: bool: True if deletion was successful; False if the ticket does not exist.
    """
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
