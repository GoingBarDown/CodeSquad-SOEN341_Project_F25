import pytest
from db import db
from routes import events_routes, ticket_routes, users_routes

@pytest.fixture(autouse=True)
def setup_routes(app):
    """
    Automatically registers all route groups before each test.

    Ensures:
        - Event routes, ticket routes, and user routes are available for test requests.
        - Test client can call all relevant endpoints without manual registration.
    """
    ticket_routes.register_routes(app)
    events_routes.register_routes(app)
    users_routes.register_routes(app)


@pytest.fixture
def student_user_and_events(client):
    """
    Fixture creating a student user along with two events and tickets linking them.

    Steps:
        1. Create a user with the role "attendee".
        2. Create two active events.
        3. Create tickets that associate the user with both events.

    Returns:
        tuple: (user_id, event_id_1, event_id_2)

    Ensures:
        - Provides a consistent test setup for endpoints that require
          attendance, participation, or student event retrieval.
    """
    # Create user
    user_resp = client.post("/users", json={
        "username": "calendaruser",
        "password": "pw",
        "email": "calendar@example.com",
        "role": "attendee"
    }).get_json()

    user_id = user_resp["id"]

    # Create events
    e1 = client.post("/events", json={
        "title": "Event 1",
        "status": "active"
    }).get_json()

    e2 = client.post("/events", json={
        "title": "Event 2",
        "status": "active"
    }).get_json()

    event_id_1 = e1["event"]["id"]
    event_id_2 = e2["event"]["id"]

    # Create tickets for the student
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id_1})
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id_2})

    return user_id, event_id_1, event_id_2


# - CREATE - 
def test_create_event_success(client):
    """
    Test creating a new event with valid data.

    Steps:
        1. Submit a POST request with valid event fields.
        2. Ensure the response reports successful creation.

    Ensures:
        - Status code 201 is returned.
        - Response body contains confirmation message and event object.
    """
    data = {
        "title": "New Event",
        "description": "Test description",
        "location": "Test Location",
        "capacity": 100
    }
    response = client.post("/events", json=data)

    assert response.status_code == 201
    body = response.get_json()
    assert body["message"] == "Event created"
    assert "event" in body


def test_create_event_missing_data(client):
    """
    Test that event creation fails when required data is missing.

    Expectation:
        - Status code 400 with error "Missing data".
    """
    response = client.post("/events", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_create_event_null_constraint_violation(client):
    """
    Test that database integrity errors (null constraints) result in a 500 failure.

    Ensures:
        - Server correctly captures SQL constraint violations.
    """
    data = {
        "title": None,
        "location": "Test Location"
    }
    resp = client.post("/events", json=data)
    assert resp.status_code == 500
    assert "Failed to create event" in resp.get_json()["error"]


# - READ - 
def test_get_all_events(client):
    """
    Test retrieving all existing events.

    Steps:
        1. Create two events.
        2. Call GET /events.
        3. Verify both appear in the result list.

    Ensures:
        - Correct event count.
        - Titles match inserted samples.
    """
    client.post("/events", json={
        "title": "Event 1",
        "location": "Loc1"
    })
    client.post("/events", json={
        "title": "Event 2",
        "location": "Loc2"
    })

    response = client.get("/events")
    assert response.status_code == 200
    events = response.get_json()
    assert len(events) == 2
    assert any(e["title"] == "Event 2" for e in events)


def test_get_all_events_internal_error(client, app):
    """
    Test that internal database errors when fetching events return a 500 error.

    Steps:
        1. Drop all tables to induce a failure.
        2. Request event list.
    """
    with app.app_context():
        db.drop_all()

    response = client.get("/events")
    assert response.status_code == 500
    body = response.get_json()
    assert "Failed to fetch events" in body["error"]


def test_get_event_by_id_success(client):
    """
    Test retrieving a single event by ID.

    Ensures:
        - Correct status code.
        - Returned event matches what was created.
    """
    create_resp = client.post("/events", json={
        "title": "Find Event",
        "location": "Hall"
    })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.get(f"/events/{event_id}")
    assert response.status_code == 200
    event = response.get_json()
    assert event["title"] == "Find Event"


def test_get_event_by_id_not_found(client):
    """
    Test that requesting a nonexistent event returns 404 Not Found.
    """
    response = client.get("/events/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"


def test_get_event_by_id_internal_error(client, app):
    """
    Test that database errors during event lookup return a 500 error.

    Steps:
        1. Create an event.
        2. Drop all tables.
        3. Attempt retrieval.
    """
    create_resp = client.post("/events", json={ "title": "Temp Event" })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/events/{event_id}")
    assert response.status_code == 500
    assert "Failed to fetch event" in response.get_json()["error"]


def test_get_student_events_success(client, student_user_and_events):
    """
    Test retrieving all events connected to a particular student via tickets.

    Ensures:
        - Endpoint returns a list.
        - Returned events match ticket assignments.
    """
    user_id, event_id_1, event_id_2 = student_user_and_events

    resp = client.get(f"/student/{user_id}/events")
    assert resp.status_code == 200

    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 2

    event_ids = {e["id"] for e in data}
    assert str(event_id_1) in event_ids
    assert str(event_id_2) in event_ids


def test_get_student_events_empty(client):
    """
    Test retrieving student events when the user has no tickets.

    Ensures:
        - Returns an empty list with status 200.
    """
    user_resp = client.post("/users", json={
        "username": "noticketsuser",
        "password": "pw",
        "email": "noevents@example.com",
        "role": "attendee"
    }).get_json()

    user_id = user_resp["id"]

    resp = client.get(f"/student/{user_id}/events")
    assert resp.status_code == 200

    data = resp.get_json()
    assert data == []


# - UPDATE - 
def test_update_event_success(client):
    """
    Test updating an event's fields.

    Steps:
        1. Create event.
        2. Update title via PUT.
        3. Assert updated data was applied.

    Ensures:
        - Update returns status 200 and correct data.
    """
    create_resp = client.post("/events", json={
        "title": "Old Title",
        "location": "Old Location"
    })
    event_id = create_resp.get_json()["event"]["id"]

    update_resp = client.put(f"/events/{event_id}", json={"title": "New Title"})
    assert update_resp.status_code == 200
    updated = update_resp.get_json()["event"]
    assert updated["title"] == "New Title"


def test_update_event_not_found(client):
    """
    Test updating a nonexistent event returns 404 Not Found.
    """
    response = client.put("/events/9999", json={"title": "Nope"})
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"


def test_update_event_missing_data(client):
    """
    Test updating an event without valid fields results in a 400 error.

    Ensures:
        - Missing update payload is flagged correctly.
    """
    create_resp = client.post("/events", json={ "title": "Update Missing" })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.put(f"/events/{event_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_update_event_internal_error(client, app):
    """
    Test that internal database errors during update return a 500 error.

    Steps:
        1. Create an event.
        2. Drop database.
        3. Attempt update.
    """
    create_resp = client.post("/events", json={ "title": "Update Fail" })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.put(f"/events/{event_id}", json={"title": "Crash"})
    assert response.status_code == 500
    assert "Failed to update event" in response.get_json()["error"]


# - DELETE - 
def test_delete_event_success(client):
    """
    Test deleting an existing event.

    Steps:
        1. Create event.
        2. Send DELETE request.
        3. Confirm success message.

    Ensures:
        - Status 200 is returned.
        - Event is deleted.
    """
    create_resp = client.post("/events", json={ "title": "Delete Me" })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.delete(f"/events/{event_id}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "Event deleted"


def test_delete_event_not_found(client):
    """
    Test deleting a nonexistent event returns 404 Not Found.
    """
    response = client.delete("/events/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"


def test_delete_event_db_failure(client, app):
    """
    Test that database errors during deletion return a 500 failure.

    Steps:
        1. Create an event.
        2. Drop database.
        3. Attempt deletion.
    """
    r = client.post("/events", json={ "title": "Crash Event" })
    eid = r.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    resp = client.delete(f"/events/{eid}")
    assert resp.status_code == 500
    assert "Failed to delete event" in resp.get_json()["error"]


# - ATTENDANCE - 
def test_get_event_attendance_success(client):
    """
    Test retrieving attendance statistics for an event.

    Ensures:
        - Status 200.
        - Response includes 'registered' and 'checked_in' fields.
    """
    create_resp = client.post("/events", json={ "title": "Attendance Event" })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.get(f"/events/{event_id}/attendance")
    assert response.status_code == 200
    body = response.get_json()
    assert "registered" in body
    assert "checked_in" in body


def test_get_event_attendance_not_found(client):
    """
    Test requesting attendance for a nonexistent event returns 404.
    """
    response = client.get("/events/9999/attendance")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"


def test_get_event_attendance_internal_error(client, app):
    """
    Test handling internal errors during attendance lookup.

    Steps:
        1. Create event.
        2. Drop database.
        3. Attempt attendance retrieval.
    """
    create_resp = client.post("/events", json={ "title": "Fail Attendance" })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/events/{event_id}/attendance")
    assert response.status_code == 500
    assert "Failed" in response.get_json()["error"]


# - PARTICIPANTS - 
def test_get_event_participants_success(client):
    """
    Test retrieving participant list for a valid event.

    Ensures:
        - Status 200.
        - Response is a list.
    """
    create_resp = client.post("/events", json={ "title": "Participants Event" })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.get(f"/events/{event_id}/participants")
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)


def test_get_event_participants_not_found(client):
    """
    Test requesting participants for nonexistent event returns 404.
    """
    response = client.get("/events/9999/participants")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"


def test_get_event_participants_internal_error(client, app):
    """
    Test handling database errors during participant lookup.

    Steps:
        1. Create event.
        2. Drop database.
        3. Call participants endpoint.
    """
    create_resp = client.post("/events", json={ "title": "Fail Participants" })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/events/{event_id}/participants")
    assert response.status_code == 500
    assert "Failed" in response.get_json()["error"]
