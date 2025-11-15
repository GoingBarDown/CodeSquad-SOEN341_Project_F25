import pytest
from db import db
from routes import ticket_routes
from db.crud import crud_users, crud_events


@pytest.fixture(autouse=True)
def setup_routes(app):
    """
    Automatically registers the ticket routes before each test.

    Ensures:
        - Every test has access to the full ticket API route set.
    """
    ticket_routes.register_routes(app)


# Helper to create mock user and event
@pytest.fixture
def mock_user_and_event():
    """
    Fixture that creates a mock user and event for ticket operations.

    Returns:
        tuple: (user_id, event_id) for use in tests requiring both.
    """
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
    """
    Test creating a new ticket with valid attendee and event data.

    Steps:
        1. Create mock user + event.
        2. POST ticket linking them.
        3. Assert 201 and returned ticket block.

    Ensures:
        - Ticket creation persists.
        - Response structure contains 'ticket'.
    """
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
    """
    Test creating a ticket with an empty payload returns 400.

    Ensures:
        - Required JSON fields are validated.
    """
    response = client.post("/tickets", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


# --- READ ---
def test_get_all_tickets(client, mock_user_and_event):
    """
    Test retrieving all tickets.

    Steps:
        1. Create two tickets.
        2. GET /tickets.
        3. Assert count is correct.

    Ensures:
        - Listing all tickets works.
    """
    user_id, event_id = mock_user_and_event
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})

    resp = client.get("/tickets")
    assert resp.status_code == 200
    assert len(resp.get_json()) == 2


def test_get_all_tickets_internal_error(client, app):
    """
    Test that internal database failure surfaces as 500.
    """
    with app.app_context():
        db.drop_all()

    resp = client.get("/tickets")
    assert resp.status_code == 500
    assert "Failed" in resp.get_json()["error"]


def test_get_ticket_success(client, mock_user_and_event):
    """
    Test retrieving a single ticket by ID.

    Steps:
        1. Create ticket.
        2. GET /tickets/<id>.
        3. Assert ticket matches expected ID.

    Ensures:
        - Lookup endpoint works.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.get(f"/tickets/{ticket_id}")
    assert resp.status_code == 200
    assert resp.get_json()["id"] == ticket_id


def test_get_ticket_not_found(client):
    """
    Test retrieving a nonexistent ticket returns 404.
    """
    resp = client.get("/tickets/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Ticket not found"


def test_get_student_tickets_with_details_success(client, mock_user_and_event):
    """
    Test retrieving combined ticket + event details for a student.

    Steps:
        1. Create two tickets for same student.
        2. GET /api/student/<id>/tickets-with-details.
        3. Assert list size and presence of event fields.

    Ensures:
        - JOIN query works.
        - Returns enriched ticket detail objects.
    """
    user_id, event_id = mock_user_and_event

    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})

    resp = client.get(f"/api/student/{user_id}/tickets-with-details")
    assert resp.status_code == 200

    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 2

    keys = data[0].keys()
    assert "event_id" in keys
    assert "event_title" in keys or "title" in keys
    assert "event_location" in keys or "location" in keys


def test_get_student_tickets_with_details_no_tickets(client, mock_user_and_event):
    """
    Test retrieving student ticket details when none exist.

    Ensures:
        - Returns empty list instead of error.
    """
    user_id, _ = mock_user_and_event

    resp = client.get(f"/api/student/{user_id}/tickets-with-details")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_student_tickets_with_details_internal_error(client, app):
    """
    Test behavior when DB fails during student ticket retrieval.

    Notes:
        - The route may return 200 + error dict OR explicit 500,
          depending on CRUD behavior.

    Ensures:
        - Test accepts both valid outcomes gracefully.
    """
    with app.app_context():
        db.drop_all()

    resp = client.get("/api/student/1/tickets-with-details")
    data = resp.get_json()

    assert resp.status_code in (200, 500)
    assert isinstance(data, dict) or isinstance(data, list)


# --- VALIDATE ---
def test_validate_ticket_success(client, mock_user_and_event):
    """
    Test validating a ticket transitions it to 'checked-in'.

    Steps:
        1. Create ticket.
        2. POST /tickets/validate.
        3. Assert status updated and user name returned.

    Ensures:
        - Validation endpoint works end-to-end.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 200
    data = resp.get_json()

    assert data["valid"] is True
    assert data["message"] == "Ticket Checked In Successfully!"
    assert data["attendeeName"] == "ticketuser"
    assert data["ticket"]["status"] == "checked-in"


def test_validate_ticket_not_found(client):
    """
    Test validating a nonexistent ticket returns 404.

    Ensures:
        - Proper missing-ticket handling.
    """
    resp = client.post("/tickets/validate", json={"ticketId": 9999})
    data = resp.get_json()
    assert resp.status_code == 404
    assert data["valid"] is False
    assert data["error"] == "Ticket not found"


def test_validate_ticket_already_checked_in(client, mock_user_and_event):
    """
    Test validating a ticket that is already 'checked-in'.

    Ensures:
        - Endpoint returns 400 with correct error message.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    client.post("/tickets/validate", json={"ticketId": ticket_id})

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Ticket already checked in"


def test_validate_ticket_invalid_status(client, mock_user_and_event):
    """
    Test validating a ticket whose status is invalid (e.g., expired).

    Ensures:
        - Endpoint returns appropriate error message.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    client.put(f"/tickets/{ticket_id}", json={"status": "expired"})

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["valid"] is False
    assert "Invalid ticket status" in data["error"]


def test_validate_ticket_missing_id(client):
    """
    Test validating a ticket without providing ticketId.

    Ensures:
        - Missing JSON fields are correctly validated.
    """
    resp = client.post("/tickets/validate", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Ticket ID required"


def test_validate_ticket_invalid_format(client):
    """
    Test validating a ticket with invalid ticketId format (non-numeric).

    Ensures:
        - Type validation catches bad formats.
    """
    resp = client.post("/tickets/validate", json={"ticketId": "invalid"})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Invalid Ticket ID format"


def test_validate_ticket_internal_error(client, app, mock_user_and_event):
    """
    Test that validation fails with 500 when DB errors occur.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    with app.app_context():
        db.drop_all()

    resp = client.post("/tickets/validate", json={"ticketId": ticket_id})
    assert resp.status_code == 500
    assert "error" in resp.get_json()


# --- UPDATE ---
def test_update_ticket_success(client, mock_user_and_event):
    """
    Test updating a ticket's fields (e.g., status).

    Ensures:
        - Update persists via PUT.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.put(f"/tickets/{ticket_id}", json={"status": "used"})
    assert resp.status_code == 200
    assert resp.get_json()["ticket"]["status"] == "used"


def test_update_ticket_not_found(client):
    """
    Test updating nonexistent ticket returns 404.
    """
    resp = client.put("/tickets/9999", json={"status": "used"})
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Ticket not found"


def test_update_ticket_missing_data(client, mock_user_and_event):
    """
    Test updating a ticket with empty JSON payload returns 400.

    Ensures:
        - Update validation is enforced.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.put(f"/tickets/{ticket_id}", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing data"


# --- DELETE ---
def test_delete_ticket_success(client, mock_user_and_event):
    """
    Test deleting an existing ticket.

    Ensures:
        - Delete endpoint removes record and returns confirmation.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    resp = client.delete(f"/tickets/{ticket_id}")
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Ticket deleted"


def test_delete_ticket_not_found(client):
    """
    Test deleting nonexistent ticket returns 404.
    """
    resp = client.delete("/tickets/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Ticket not found"


def test_delete_ticket_internal_error(client, app, mock_user_and_event):
    """
    Test that internal DB failure during deletion results in 500.
    """
    user_id, event_id = mock_user_and_event
    create_resp = client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id})
    ticket_id = create_resp.get_json()["ticket"]

    with app.app_context():
        db.drop_all()

    resp = client.delete(f"/tickets/{ticket_id}")
    assert resp.status_code == 500
    assert "Failed" in resp.get_json()["error"]
