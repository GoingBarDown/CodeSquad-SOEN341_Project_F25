import pytest
from db.crud import crud_ticket
from db.models import Ticket
from db import db

@pytest.fixture
def sample_ticket_data():
    # You want to create a mock ticket value here so it gets used for the tests below
    pass

def test_create_ticket(session, sample_ticket_data):
    pass

def test_create_ticket_invalid_data(session):
    pass

def test_get_ticket_by_id(session, sample_ticket_data):
    pass

def test_get_ticket_by_id_not_found(session):
    pass

def test_get_all_tickets(session, sample_ticket_data):
    pass

def test_update_ticket(session, sample_ticket_data):
    pass

def test_update_nonexistent_ticket(session):
    pass

def test_delete_ticket(session, sample_ticket_data):
    pass

def test_delete_nonexistent_ticket(session):
    pass
