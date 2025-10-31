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
    events = db.session.query(Event).all()
    return [event.data for event in events]

def get_event_by_id(event_id):
    event = db.session.get(Event, event_id)
    return event.data if event else None

def create_event(data):
    data = _normalize_event_dates(data)
    event = Event(**data)
    db.session.add(event)
    db.session.commit()
    return event.data

def delete_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return False

    db.session.delete(event)
    db.session.commit()
    return True

def update_event(event_id, data):
    event = db.session.get(Event, event_id)
    if not event:
        return None

    data = _normalize_event_dates(data)

    for key, value in data.items():
        if hasattr(event, key):
            setattr(event, key, value)

    db.session.commit()
    return event.data