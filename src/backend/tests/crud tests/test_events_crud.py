import pytest
from db.crud import crud_events
from db.models import Event
from db import db

@pytest.fixture
def sample_event_data():
    return {
        "title": "Music Festival",
        "description": "Outdoor summer music event",
        "location": "Central Park",
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
    assert db_event.location == "Central Park"

def test_create_event_invalid_data(session):
    with pytest.raises(RuntimeError):
        crud_events.create_event({"title": None})

def test_get_event_by_id(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    result = crud_events.get_event_by_id(event_id)
    assert result["title"] == "Music Festival"

def test_get_event_by_id_not_found(session):
    result = crud_events.get_event_by_id(9999)
    assert result is None

def test_get_all_events(session, sample_event_data):
    crud_events.create_event(sample_event_data)
    crud_events.create_event({
        "title": "Rave",
        "description": "Cramped and bad music",
        "location": "Underground Club",
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
    assert any(e["location"] == "Underground Club" for e in events)


def test_update_event(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    crud_events.update_event(event_id, {"title": "updated"})
    updated = db.session.get(Event, event_id)
    assert updated.title == "updated"

def test_update_nonexistent_event(session):
    result = crud_events.update_event(9999, {"title": "Doesn't exist"})
    assert result is None

def test_delete_event(session, sample_event_data):
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    assert crud_events.delete_event(event_id) is True
    assert db.session.get(Event, event_id) is None

def test_delete_nonexistent_event(session):
    assert crud_events.delete_event(9999) is False
