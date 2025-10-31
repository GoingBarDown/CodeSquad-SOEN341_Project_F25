import pytest
from db.crud import crud_events
from db.models import Event
from db import db

@pytest.fixture
def sample_event_data():
    return {
        "title": "Music Festival",
        "description": "Outdoor summer music event",
        "start_date": "2025-08-12T18:00:00",
        "end_date": "2025-08-12T23:00:00",
        "category": "Music",
        "capacity": 500,
        "price": 49.99,
        "link": "https://tickets.com/festival",
        "organizer_id": 1,
        "seating": "open",
        "status": "active",
        "rating": 4.8
    }

def test_create_event(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]

    db_event = db.session.get(Event, event_id)
    assert db_event.title == "Music Festival"
    assert db_event.category == "Music"

def test_get_event_by_id(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]

    result = crud_events.get_event_by_id(event_id)
    assert result["title"] == "Music Festival"

def test_get_all_events(session, sample_event_data):
    crud_events.create_event(sample_event_data)
    crud_events.create_event({
        "title": "Rave",
        "description": "Cramped and bad music",
        "start_date": "2025-10-12T18:00:00",
        "end_date": "2025-10-12T23:00:00",
        "category": "Music",
        "capacity": 200,
        "price": 45.99,
        "link": "https://tickets.com/rave",
        "organizer_id": 2,
        "seating": "open",
        "status": "active",
        "rating": 3.0
    })

    events = crud_events.get_all_events()
    assert len(events) == 2
    assert any(e["title"] == "Rave" for e in events)

def test_update_event(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]

    crud_events.update_event(event_id, {"title": "updated"})
    updated = db.session.get(Event, event_id)
    assert updated.title == "updated"

def test_delete_event(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]

    assert crud_events.delete_event(event_id) is True
    assert db.session.get(Event, event_id) is None

def test_delete_nonexistent_event(session):
    assert crud_events.delete_event(9999) is False
