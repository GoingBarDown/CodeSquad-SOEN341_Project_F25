from db.models import Event
from db import db
from ..utils import parse_iso_datetime

def _normalize_event_dates(data):
    """Normalize event date fields by converting ISO-formatted date strings into datetime objects for the keys "start_date" and "end_date".
    
    Parameters: data (dict): A dictionary containing event fields.
    
    Returns: dict: Updated dictionary with parsed datetime fields when applicable.
    """
    for field in ["start_date", "end_date"]:
        if field in data:
            parsed = parse_iso_datetime(data[field])
            if parsed:
                data[field] = parsed
    return data

def get_all_events():
    """Retrieve all events stored in the database.
    
    Returns: A list of dictionaries, each representing an event object."""
    try:
        events = db.session.query(Event).all()
        return [event.data for event in events]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch events: {e}")


def get_event_by_id(event_id):
    """Retrieve a single event by its unique identifier.
    
    Parameters: event_id (int): The id of the event to retrieve.
    
    Returns: A dictionary or None depending on whether the event was found."""
    try:
        event = db.session.get(Event, event_id)
        if not event:
            return None
        return event.data
    except ValueError:
        raise 
    except Exception as e:
        raise RuntimeError(f"Failed to fetch event {event_id}: {e}")

def create_event(data):
    """Creates an event in the database.
    
    Parameters: data (dict): A dictionary containing the event data.
    
    Returns: The data of the newly created event."""
    try:
        data = _normalize_event_dates(data)
        event = Event(**data)
        db.session.add(event)
        db.session.commit()
        return event.data
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create event: {e}")

def delete_event(event_id):
    """Deletes an event from the database.
    
    Parameters: event_id (int) the id of the event to remove from the database.
    
    Returns: True or False depending on whether the event was deleted."""
    try:
        event = db.session.get(Event, event_id)
        if not event:
            return False

        db.session.delete(event)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to delete event {event_id}: {e}")

def update_event(event_id, data):
    """Updates an event in the database.
    
    Parameters: event_id (int): The id of the event to update.
    
    data (dict): The new data to insert into the event.
    
    Returns: The newly updated event data."""
    try:
        event = db.session.get(Event, event_id)
        if not event:
            return None

        data = _normalize_event_dates(data)

        for key, value in data.items():
            if hasattr(event, key):
                setattr(event, key, value)

        db.session.commit()
        return event.data
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update event {event_id}: {e}")

