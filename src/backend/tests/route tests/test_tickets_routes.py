import pytest
from db import db
from routes import ticket_routes
from db.crud import crud_users, crud_events


@pytest.fixture(autouse=True)
def setup_routes(app):
    ticket_routes.register_routes(app)


# Helper to create mock user and event
@pytest.fixture
def mock_user_and_event():
    user_id = crud_users.create_user({
        "username": "ticketuser",
        "password": "pass",
        "email": "ticket@example.com",
        "role": "attendee"
    })

    event = crud_events.create_event({
        "title": "Event A",
        "status": "active"
    })
    event_id = event["id"] if isinstance(event, dict) else event
    return user_id, event_id


# --- CREATE ---
def test_create_ticket_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event

    response = client.post("/tickets", json={
        "attendee_id": user_id,
        "event_id": event_id,
        "qr_code": "abcd1234"
    })

    assert response.status_code == 201
    body = response.get_json()
    assert body["message"] == "Ticket created"
    assert "ticket" in body


def test_create_ticket_missing_data(client):
    response = client.post("/tickets", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


# --- READ ---
def test_get_all_tickets(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})

    resp = client.get("/tickets")
    assert resp.status_code == 200
    assert len(resp.get_json()) == 2


def test_get_all_tickets_internal_error(client, app):
    with app.app_context():
        db.drop_all()

    resp = client.get("/tickets")
    assert resp.status_code == 500
    assert "Failed" in resp.get_json()["error"]


def test_get_ticket_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.get(f"/tickets/{ticket_id}")
    assert resp.status_code == 200
    assert resp.get_json()["id"] == ticket_id


def test_get_ticket_not_found(client):
    resp = client.get("/tickets/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Ticket not found"


# --- VALIDATE ---
def test_validate_ticket_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["valid"] is True
    assert data["attendeeName"] == "ticketuser"


def test_validate_ticket_not_found(client):
    resp = client.post("/tickets/validate", json={"ticketId": 9999})
    assert resp.status_code == 200
    assert resp.get_json()["valid"] is False


def test_validate_ticket_missing_id(client):
    resp = client.post("/tickets/validate", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Ticket ID required"


# --- UPDATE ---
def test_update_ticket_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.put(f"/tickets/{ticket_id}", json={"status": "used"})
    assert resp.status_code == 200
    assert resp.get_json()["ticket"]["status"] == "used"


def test_update_ticket_not_found(client):
    resp = client.put("/tickets/9999", json={"status": "used"})
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Ticket not found"


def test_update_ticket_missing_data(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.put(f"/tickets/{ticket_id}", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing data"


# --- DELETE ---
def test_delete_ticket_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.delete(f"/tickets/{ticket_id}")
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Ticket deleted"


def test_delete_ticket_not_found(client):
    resp = client.delete("/tickets/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Ticket not found"


def test_delete_ticket_internal_error(client, app, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    with app.app_context():
        db.drop_all()

    resp = client.delete(f"/tickets/{ticket_id}")
    assert resp.status_code == 500
    assert "Failed" in resp.get_json()["error"]
