import pytest
from db.crud import crud_ticket
from db.models import Ticket, Event
from db import db

@pytest.fixture
def sample_ticket_data():
    """
    Fixture providing a basic valid ticket payload.

    Returns:
        dict: A dictionary with attendee_id, event_id, and qr_code fields.
    """
    return {
        "attendee_id": 1,
        "event_id": 1,
        "qr_code": "QRCODE123"
    }


def test_create_ticket(session, sample_ticket_data):
    """
    Test creating a ticket record.

    Steps:
        1. Create a ticket using valid sample data.
        2. Retrieve the ticket directly from the database.
        3. Assert that the ticket exists and fields match expected values.

    Ensures:
        - Ticket creation works.
        - Database persistence is correct.
    """
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    db_ticket = db.session.get(Ticket, ticket_id)

    assert db_ticket is not None
    assert db_ticket.attendee_id == 1
    assert db_ticket.qr_code == "QRCODE123"


def test_create_ticket_invalid_data(session):
    """
    Test creating a ticket with invalid input.

    Ensures:
        - CRUD operation raises RuntimeError when required fields are missing.
    """
    with pytest.raises(RuntimeError):
        crud_ticket.create_ticket({"attendee_id": None})


def test_get_ticket_by_id(session, sample_ticket_data):
    """
    Test retrieving a ticket by its ID.

    Steps:
        1. Create a ticket.
        2. Retrieve it via `get_ticket_by_id`.
        3. Validate returned ticket data.

    Ensures:
        - Ticket lookup by ID works correctly.
    """
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    result = crud_ticket.get_ticket_by_id(ticket_id)

    assert result["attendee_id"] == 1
    assert result["qr_code"] == "QRCODE123"


def test_get_ticket_by_id_not_found(session):
    """
    Test retrieving a ticket using a non-existent ID.

    Ensures:
        - Function returns None instead of raising an exception.
    """
    result = crud_ticket.get_ticket_by_id(9999)
    assert result is None


def test_get_tickets_by_event(session, sample_ticket_data):
    """
    Test retrieving all tickets for a specific event.

    Steps:
        1. Create two tickets for event_id=1.
        2. Create an unrelated ticket for event_id=2.
        3. Retrieve tickets for event_id=1.
        4. Validate that only the two matching tickets are returned.
        5. Check that querying a non-existent event returns an empty list.

    Ensures:
        - Filtering tickets by event ID works as expected.
    """
    crud_ticket.create_ticket(sample_ticket_data)
    crud_ticket.create_ticket({
        "attendee_id": 2,
        "event_id": 1,
        "qr_code": "QRCODE456"
    })
    crud_ticket.create_ticket({
        "attendee_id": 3,
        "event_id": 2,
        "qr_code": "QRCODE789"
    })

    tickets = crud_ticket.get_tickets_by_event(1)
    assert len(tickets) == 2
    assert all(t["event_id"] == 1 for t in tickets)
    assert any(t["qr_code"] == "QRCODE456" for t in tickets)

    empty_result = crud_ticket.get_tickets_by_event(9999)
    assert empty_result == []


def test_get_tickets_by_user(session, sample_ticket_data):
    """
    Test retrieving tickets by user/attendee ID.

    Steps:
        1. Create two tickets for attendee_id=1.
        2. Create a third ticket for a different attendee.
        3. Retrieve tickets for attendee_id=1.
        4. Validate returned results.

    Ensures:
        - Ticket filtering by attendee_id works correctly.
    """
    crud_ticket.create_ticket(sample_ticket_data)
    crud_ticket.create_ticket({
        "attendee_id": 1,
        "event_id": 2,
        "qr_code": "QRCODE456"
    })
    crud_ticket.create_ticket({
        "attendee_id": 2,
        "event_id": 1,
        "qr_code": "QRCODE999"
    })

    tickets = crud_ticket.get_tickets_by_user(1)

    assert tickets is not None
    assert len(tickets) == 2
    assert all(t["attendee_id"] == 1 for t in tickets)


def test_get_tickets_by_user_none(session):
    """
    Test retrieving tickets for a user with no ticket records.

    Ensures:
        - Function returns an empty list when the user has zero tickets.
    """
    tickets = crud_ticket.get_tickets_by_user(999)
    assert len(tickets) == 0


def test_get_tickets_by_user_error(session):
    """
    Test behavior when database failure occurs during user ticket lookup.

    Steps:
        1. Drop all tables.
        2. Attempt to fetch tickets.
        3. Ensure a RuntimeError is raised.

    Ensures:
        - Error handling path is triggered on DB failure.
    """
    db.drop_all()

    with pytest.raises(RuntimeError):
        crud_ticket.get_tickets_by_user(1)


def test_get_all_tickets(session, sample_ticket_data):
    """
    Test retrieving all tickets in the system.

    Steps:
        1. Create two tickets.
        2. Retrieve all tickets.
        3. Validate count and correctness.

    Ensures:
        - Bulk retrieval returns all ticket records.
    """
    crud_ticket.create_ticket(sample_ticket_data)
    crud_ticket.create_ticket({
        "attendee_id": 2,
        "event_id": 1,
        "qr_code": "QRCODE999"
    })

    tickets = crud_ticket.get_all_tickets()

    assert len(tickets) == 2
    assert any(t["qr_code"] == "QRCODE999" for t in tickets)


def test_update_ticket(session, sample_ticket_data):
    """
    Test updating an existing ticket.

    Steps:
        1. Create a ticket.
        2. Update its QR code.
        3. Validate that the database reflects the change.

    Ensures:
        - Ticket updates work correctly.
    """
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    crud_ticket.update_ticket(ticket_id, {"qr_code": "UPDATED123"})

    updated = db.session.get(Ticket, ticket_id)
    assert updated.qr_code == "UPDATED123"


def test_update_nonexistent_ticket(session):
    """
    Test updating a ticket that does not exist.

    Ensures:
        - Function returns None instead of raising errors.
    """
    result = crud_ticket.update_ticket(9999, {"qr_code": "NEWCODE"})
    assert result is None


def test_delete_ticket(session, sample_ticket_data):
    """
    Test deleting a ticket.

    Steps:
        1. Create a ticket.
        2. Delete it.
        3. Confirm deletion and database removal.

    Ensures:
        - Ticket deletion works and removes the entry from persistence.
    """
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)

    assert crud_ticket.delete_ticket(ticket_id) is True
    assert db.session.get(Ticket, ticket_id) is None


def test_delete_nonexistent_ticket(session):
    """
    Test deleting a non-existent ticket.

    Ensures:
        - Function returns False when deletion target does not exist.
    """
    assert crud_ticket.delete_ticket(9999) is False


def test_get_tickets_and_events_for_user_success(session):
    """
    Test retrieving ticket and event details for a user.

    Steps:
        1. Create an event.
        2. Create two tickets for the same student and event.
        3. Retrieve combined ticket-event records.
        4. Validate returned structure and values.

    Ensures:
        - Combined query returns enriched ticket + event data.
    """
    event = Event(title="Concert", location="Main Hall")
    db.session.add(event)
    db.session.commit()

    crud_ticket.create_ticket({"attendee_id": 10, "event_id": event.id, "qr_code": "QR1"})
    crud_ticket.create_ticket({"attendee_id": 10, "event_id": event.id, "qr_code": "QR2"})

    results = crud_ticket.get_tickets_and_events_for_user(10)

    assert isinstance(results, list)
    assert len(results) == 2

    for entry in results:
        assert "ticket_id" in entry
        assert "ticket_status" in entry
        assert "event_id" in entry
        assert entry["event_title"] == "Concert"
        assert entry["event_location"] == "Main Hall"


def test_get_tickets_and_events_for_user_no_results(session):
    """
    Test retrieving enriched ticket-event info for a user with no tickets.

    Ensures:
        - Function returns an empty list.
    """
    results = crud_ticket.get_tickets_and_events_for_user(999)

    assert isinstance(results, list)
    assert results == []


def test_get_tickets_and_events_for_user_error(session):
    """
    Test error path for ticket-event retrieval when DB fails.

    Ensures:
        - Function returns an empty list instead of raising an exception.
    """
    db.drop_all()

    results = crud_ticket.get_tickets_and_events_for_user(1)

    assert isinstance(results, list)
    assert results == []
