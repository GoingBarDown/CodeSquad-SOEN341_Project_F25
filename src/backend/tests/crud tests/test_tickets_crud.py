import pytest
from db.crud import crud_ticket
from db.models import Ticket, Event
from db import db

@pytest.fixture
def sample_ticket_data():
    return {
        "attendee_id": 1,
        "event_id": 1,
        "qr_code": "QRCODE123"
    }

def test_create_ticket(session, sample_ticket_data):
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    db_ticket = db.session.get(Ticket, ticket_id)
    assert db_ticket is not None
    assert db_ticket.attendee_id == 1
    assert db_ticket.qr_code == "QRCODE123"

def test_create_ticket_invalid_data(session):
    with pytest.raises(RuntimeError):
        crud_ticket.create_ticket({"attendee_id": None})

def test_get_ticket_by_id(session, sample_ticket_data):
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    result = crud_ticket.get_ticket_by_id(ticket_id)
    assert result["attendee_id"] == 1
    assert result["qr_code"] == "QRCODE123"

def test_get_ticket_by_id_not_found(session):
    result = crud_ticket.get_ticket_by_id(9999)
    assert result is None 

def test_get_tickets_by_event(session, sample_ticket_data):
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
    tickets = crud_ticket.get_tickets_by_user(999)
    assert len(tickets) == 0

def test_get_tickets_by_user_error(session):
    db.drop_all()
    with pytest.raises(RuntimeError):
        crud_ticket.get_tickets_by_user(1)

def test_get_all_tickets(session, sample_ticket_data):
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
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    crud_ticket.update_ticket(ticket_id, {"qr_code": "UPDATED123"})
    updated = db.session.get(Ticket, ticket_id)
    assert updated.qr_code == "UPDATED123"

def test_update_nonexistent_ticket(session):
    result = crud_ticket.update_ticket(9999, {"qr_code": "NEWCODE"})
    assert result is None

def test_delete_ticket(session, sample_ticket_data):
    ticket_id = crud_ticket.create_ticket(sample_ticket_data)
    assert crud_ticket.delete_ticket(ticket_id) is True
    assert db.session.get(Ticket, ticket_id) is None

def test_delete_nonexistent_ticket(session):
    assert crud_ticket.delete_ticket(9999) is False

def test_get_tickets_and_events_for_user_success(session):
    """Should return ticket + event details for a given student."""
    # Create an event
    event = Event(title="Concert", location="Main Hall")
    db.session.add(event)
    db.session.commit()

    # Create two tickets for same student, same event
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
    """Should return empty list if student has no tickets."""
    results = crud_ticket.get_tickets_and_events_for_user(999)
    assert isinstance(results, list)
    assert results == []


def test_get_tickets_and_events_for_user_error(session):
    """Should return empty list (and print error) if DB fails."""
    db.drop_all()
    results = crud_ticket.get_tickets_and_events_for_user(1)
    assert isinstance(results, list)
    assert results == []