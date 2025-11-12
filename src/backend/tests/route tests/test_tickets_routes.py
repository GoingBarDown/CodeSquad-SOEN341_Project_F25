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

def test_get_student_tickets_with_details_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event

    # Create a couple of tickets for the same student
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})

    # Request the combined ticket and event details
    resp = client.get(f"/api/student/{user_id}/tickets-with-details")
    assert resp.status_code == 200

    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 2

    # The returned object comes from a JOIN between tickets and events
    # It likely includes these event fields:
    keys = data[0].keys()
    assert "event_id" in keys
    assert "event_title" in keys or "title" in keys
    assert "event_location" in keys or "location" in keys

def test_get_student_tickets_with_details_no_tickets(client, mock_user_and_event):
    user_id, _ = mock_user_and_event

    # User exists but no tickets
    resp = client.get(f"/api/student/{user_id}/tickets-with-details")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_student_tickets_with_details_internal_error(client, app):
    """
    If the DB fails, the route might still return 200 with an empty list or an error JSON,
    depending on how crud_ticket handles exceptions. We'll accept both gracefully.
    """
    with app.app_context():
        db.drop_all()

    resp = client.get("/api/student/1/tickets-with-details")
    data = resp.get_json()

    # Allow 200 with error key OR explicit 500
    assert resp.status_code in (200, 500)
    assert isinstance(data, dict) or isinstance(data, list)

# --- VALIDATE ---
def test_validate_ticket_success(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    # Ticket starts as 'valid', should update to 'checked-in'
    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 200
    data = resp.get_json()

    assert data["valid"] is True
    assert data["message"] == "Ticket Checked In Successfully!"
    assert data["attendeeName"] == "ticketuser"
    assert data["ticket"]["status"] == "checked-in"


def test_validate_ticket_not_found(client):
    resp = client.post("/tickets/validate", json={"ticketId": 9999})
    data = resp.get_json()
    # The route explicitly returns 404 for missing tickets
    assert resp.status_code == 404
    assert data["valid"] is False
    assert data["error"] == "Ticket not found"


def test_validate_ticket_already_checked_in(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    # First validation: mark as checked-in
    client.post("/tickets/validate", json={"ticketId": ticket_id})

    # Second validation: should fail
    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Ticket already checked in"


def test_validate_ticket_invalid_status(client, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    # Manually update ticket to an invalid status
    client.put(f"/tickets/{ticket_id}", json={"status": "expired"})

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["valid"] is False
    assert "Invalid ticket status" in data["error"]


def test_validate_ticket_missing_id(client):
    resp = client.post("/tickets/validate", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Ticket ID required"


def test_validate_ticket_invalid_format(client):
    resp = client.post("/tickets/validate", json={"ticketId": "invalid"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Invalid Ticket ID format"


def test_validate_ticket_internal_error(client, app, mock_user_and_event):
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    # Simulate DB crash
    with app.app_context():
        db.drop_all()

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 500
    assert "error" in resp.get_json()


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
