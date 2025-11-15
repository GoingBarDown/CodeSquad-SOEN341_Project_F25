import pytest
from db.crud import crud_events
from db.models import Event
from db import db

@pytest.fixture
def sample_event_data():
    """
    Fixture providing a complete and valid sample event dictionary.
    This data simulates user input passed into CRUD event creation functions.

    Returns: dict: A dictionary containing all required fields for creating an Event.
    """
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
    """
    Test that a valid event can be created through the CRUD layer.

    Steps:
        1. Create an event using valid sample data.
        2. Retrieve the event from the database.
        3. Assert that key fields match what was originally provided.

    Ensures:
        - Event creation is successful.
        - Persisted Event matches input values.
    """
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    db_event = db.session.get(Event, event_id)
    assert db_event.title == "Music Festival"
    assert db_event.category == "Music"
    assert db_event.location == "Central Park"


def test_create_event_invalid_data(session):
    """
    Test that creating an event with invalid data raises an appropriate error.

    Expectation:
        - Passing a malformed or incomplete dictionary should raise RuntimeError.
    """
    with pytest.raises(RuntimeError):
        crud_events.create_event({"title": None})


def test_get_event_by_id(session, sample_event_data):
    """
    Test retrieving an existing event by its database ID.

    Steps:
        1. Create a valid event.
        2. Retrieve it using `get_event_by_id`.
        3. Verify the retrieved data matches the created event.

    Ensures:
        - Event lookup by ID works correctly.
    """
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    result = crud_events.get_event_by_id(event_id)
    assert result["title"] == "Music Festival"


def test_get_event_by_id_not_found(session):
    """
    Test retrieving a non-existent event returns None.

    Ensures:
        - The CRUD layer gracefully handles lookups for missing records.
    """
    result = crud_events.get_event_by_id(9999)
    assert result is None


def test_get_all_events(session, sample_event_data):
    """
    Test retrieving all events from the database.

    Steps:
        1. Create two events.
        2. Call `get_all_events`.
        3. Assert that both events appear in the returned list.

    Ensures:
        - Multiple events can be retrieved.
        - Data returned contains correct titles and locations.
    """
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
    """
    Test updating fields on an existing event.

    Steps:
        1. Create a valid event.
        2. Update the event's title.
        3. Verify title is modified in the database.

    Ensures:
        - Updates correctly persist.
    """
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    crud_events.update_event(event_id, {"title": "updated"})
    updated = db.session.get(Event, event_id)
    assert updated.title == "updated"


def test_update_nonexistent_event(session):
    """
    Test updating a non-existent event returns None rather than raising.

    Ensures:
        - The CRUD layer handles missing IDs gracefully during updates.
    """
    result = crud_events.update_event(9999, {"title": "Doesn't exist"})
    assert result is None


def test_delete_event(session, sample_event_data):
    """
    Test deleting an existing event.

    Steps:
        1. Create a valid event.
        2. Delete it using `delete_event`.
        3. Verify the record is removed from the database.

    Ensures:
        - Deletion returns True.
        - Event is removed from persistence.
    """
    event = crud_events.create_event(sample_event_data)
    event_id = event["id"]
    assert crud_events.delete_event(event_id) is True
    assert db.session.get(Event, event_id) is None


def test_delete_nonexistent_event(session):
    """
    Test that deleting a non-existent event returns False.

    Ensures:
        - The CRUD layer correctly indicates when no record was deleted.
    """
    assert crud_events.delete_event(9999) is False
