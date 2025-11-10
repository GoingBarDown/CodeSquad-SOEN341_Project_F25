import pytest
from db import db
from routes import events_routes, ticket_routes, users_routes

@pytest.fixture(autouse=True)
def setup_routes(app):
    ticket_routes.register_routes(app)
    events_routes.register_routes(app)
    users_routes.register_routes(app)

@pytest.fixture
def student_user_and_events(client):
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

    # Create tickets (must match your system's ticket POST payload)
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id_1})
    client.post("/tickets", json={"attendee_id": user_id, "event_id": event_id_2})

    return user_id, event_id_1, event_id_2

# - CREATE - 
def test_create_event_success(client):
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
    response = client.post("/events", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"

def test_create_event_null_constraint_violation(client):
    data = {
        "title": None,
        "location": "Test Location"
    }
    resp = client.post("/events", json=data)
    assert resp.status_code == 500
    assert "Failed to create event" in resp.get_json()["error"]

# - READ - 
def test_get_all_events(client):
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
    with app.app_context():
        db.drop_all()

    response = client.get("/events")
    assert response.status_code == 500
    body = response.get_json()
    assert "Failed to fetch events" in body["error"]

def test_get_event_by_id_success(client):
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
    response = client.get("/events/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"

def test_get_event_by_id_internal_error(client, app):
    create_resp = client.post("/events", json={
        "title": "Temp Event"
    })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/events/{event_id}")
    assert response.status_code == 500
    assert "Failed to fetch event" in response.get_json()["error"]

def test_get_student_events_success(client, student_user_and_events):
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
    response = client.put("/events/9999", json={"title": "Nope"})
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"

def test_update_event_missing_data(client):
    create_resp = client.post("/events", json={
        "title": "Update Missing"
    })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.put(f"/events/{event_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"

def test_update_event_internal_error(client, app):
    create_resp = client.post("/events", json={
        "title": "Update Fail"
    })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.put(f"/events/{event_id}", json={"title": "Crash"})
    assert response.status_code == 500
    assert "Failed to update event" in response.get_json()["error"]

# - DELETE - 
def test_delete_event_success(client):
    create_resp = client.post("/events", json={
        "title": "Delete Me"
    })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.delete(f"/events/{event_id}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "Event deleted"

def test_delete_event_not_found(client):
    response = client.delete("/events/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"

def test_delete_event_db_failure(client, app):
    r = client.post("/events", json={
        "title": "Crash Event"
    })
    eid = r.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    resp = client.delete(f"/events/{eid}")
    assert resp.status_code == 500
    assert "Failed to delete event" in resp.get_json()["error"]

# - ATTENDANCE - 
def test_get_event_attendance_success(client):
    create_resp = client.post("/events", json={
        "title": "Attendance Event"
    })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.get(f"/events/{event_id}/attendance")
    assert response.status_code == 200
    body = response.get_json()
    assert "registered" in body
    assert "checked_in" in body

def test_get_event_attendance_not_found(client):
    response = client.get("/events/9999/attendance")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"

def test_get_event_attendance_internal_error(client, app):
    create_resp = client.post("/events", json={
        "title": "Fail Attendance"
    })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/events/{event_id}/attendance")
    assert response.status_code == 500
    assert "Failed" in response.get_json()["error"]

# - PARTICIPANTS - 
def test_get_event_participants_success(client):
    create_resp = client.post("/events", json={
        "title": "Participants Event"
    })
    event_id = create_resp.get_json()["event"]["id"]

    response = client.get(f"/events/{event_id}/participants")
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_get_event_participants_not_found(client):
    response = client.get("/events/9999/participants")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"

def test_get_event_participants_internal_error(client, app):
    create_resp = client.post("/events", json={
        "title": "Fail Participants"
    })
    event_id = create_resp.get_json()["event"]["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/events/{event_id}/participants")
    assert response.status_code == 500
    assert "Failed" in response.get_json()["error"]
