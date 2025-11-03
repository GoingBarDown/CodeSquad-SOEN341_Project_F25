from db.models import Event
from db import db
from ..utils import parse_iso_datetime


def _normalize_event_dates(data):
    for field in ["start_date", "end_date"]:
        if field in data:
            parsed = parse_iso_datetime(data[field])
            if parsed:
                data[field] = parsed
    return data


def get_all_events():
    try:
        events = db.session.query(Event).all()
        return [event.data for event in events]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch events: {e}")


def get_event_by_id(event_id):
    try:
        event = db.session.get(Event, event_id)
        if not event:
            raise ValueError(f"Event with id {event_id} not found.")
        return event.data
    except ValueError:
        raise 
    except Exception as e:
        raise RuntimeError(f"Failed to fetch event {event_id}: {e}")

def create_event(data):
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
    try:
        event = db.session.get(Event, event_id)
        if not event:
            raise ValueError(f"Event with id {event_id} not found.")

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

