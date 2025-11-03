import pytest
from db.crud import crud_ticket
from db.models import Ticket
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
