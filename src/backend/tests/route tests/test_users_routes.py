import pytest
from db import db
from db.models import User
from routes import users_routes


@pytest.fixture(autouse=True)
def setup_routes(app):
    """
    Automatically registers the user routes before each test case.

    Ensures:
        - Every test has access to the full user API route set.
    """
    users_routes.register_routes(app)


# --- CREATE ---
def test_create_user_success(client):
    """
    Test creating a new user with complete and valid data.

    Steps:
        1. Provide full user JSON payload.
        2. POST /users.
        3. Assert 201 + returned ID.

    Ensures:
        - User creation persists.
        - Response includes 'User created' message and user ID.
    """
    data = {
        "username": "newuser",
        "password": "securepassword",
        "email": "new@example.com",
        "role": "user",
        "first_name": "John",
        "last_name": "Doe",
        "student_id": 1,
        "program": "CS"
    }
    response = client.post("/users", json=data)

    assert response.status_code == 201
    body = response.get_json()
    assert body["message"] == "User created"
    assert "id" in body


def test_create_user_missing_data(client):
    """
    Test creating a user with an empty payload.

    Ensures:
        - Required JSON fields are validated.
        - Returns 400 with 'Missing data'.
    """
    response = client.post("/users", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_create_user_null_constraint_violation(client):
    """
    Test creating a user with NULL fields that violate DB constraints.

    Ensures:
        - Database triggers 500.
        - Error contains 'Failed to create user'.
    """
    data = {
        "username": None,
        "password": "pw",
        "email": "bad@example.com",
        "role": "user",
        "first_name": "Bad",
        "last_name": "User",
        "student_id": 2,
        "program": "ENG"
    }
    resp = client.post("/users", json=data)
    assert resp.status_code == 500
    assert "Failed to create user" in resp.get_json()["error"]


def test_create_user_unique_constraint_violation(client):
    """
    Test creating a user that violates unique constraints (email/username).

    Ensures:
        - Duplicate fields raise 500.
        - Error contains 'Failed to create user'.
    """
    data = {
        "username": "dupe",
        "password": "pw",
        "email": "dupe@example.com",
        "role": "user",
        "first_name": "Jane",
        "last_name": "Smith",
        "student_id": 3,
        "program": "BIO"
    }
    client.post("/users", json=data)

    resp = client.post("/users", json=data)
    assert resp.status_code == 500
    assert "Failed to create user" in resp.get_json()["error"]


# --- READ ---
def test_get_all_users(client):
    """
    Test retrieving all users.

    Steps:
        1. Create two users.
        2. GET /users.
        3. Assert count and known usernames.

    Ensures:
        - Listing endpoint returns correct number of records.
    """
    client.post("/users", json={
        "username": "u1",
        "password": "p1",
        "email": "u1@example.com",
        "role": "user",
        "first_name": "A",
        "last_name": "B",
        "student_id": 4,
        "program": "CS"
    })
    client.post("/users", json={
        "username": "u2",
        "password": "p2",
        "email": "u2@example.com",
        "role": "admin",
        "first_name": "C",
        "last_name": "D",
        "student_id": 5,
        "program": "MATH"
    })

    response = client.get("/users")
    assert response.status_code == 200
    users = response.get_json()

    assert len(users) == 2
    assert any(u["username"] == "u2" for u in users)


def test_get_all_users_internal_error(client, app):
    """
    Test retrieving all users when DB is dropped.

    Ensures:
        - 500 is returned.
        - Error contains 'Failed to retrieve users'.
    """
    with app.app_context():
        db.drop_all()

    response = client.get("/users")

    assert response.status_code == 500
    body = response.get_json()
    assert "Failed to retrieve users" in body["error"]


def test_get_user_by_id_success(client):
    """
    Test retrieving a single user by ID.

    Steps:
        1. Create user.
        2. GET /users/<id>.
        3. Assert returned username.

    Ensures:
        - Lookup endpoint returns correct record.
    """
    create_resp = client.post("/users", json={
        "username": "findme",
        "password": "pass",
        "email": "find@example.com",
        "role": "user",
        "first_name": "E",
        "last_name": "F",
        "student_id": 6,
        "program": "ENG"
    })
    user_id = create_resp.get_json()["id"]

    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    user = response.get_json()

    assert user["username"] == "findme"


def test_get_user_by_id_not_found(client):
    """
    Test retrieving a nonexistent user returns 404.

    Ensures:
        - Proper error message is returned.
    """
    response = client.get("/users/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "User not found"


def test_get_user_by_id_internal_error(client, app):
    """
    Test behavior when DB fails during ID lookup.

    Ensures:
        - 500 status.
        - Error contains 'Failed to retrieve user'.
    """
    with app.app_context():
        db.drop_all()

    response = client.get("/users/1")
    assert response.status_code == 500
    assert "Failed to retrieve user" in response.get_json()["error"]


# --- AUTHENTICATION ---
def test_auth_user_success(client):
    """
    Test successful authentication using valid credentials.

    Steps:
        1. Create user.
        2. POST /users/auth.
        3. Assert 'Authenticated'.

    Ensures:
        - Auth endpoint verifies credentials and returns user object.
    """
    client.post("/users", json={
        "username": "loginuser",
        "password": "mypassword",
        "email": "login@example.com",
        "role": "user",
        "first_name": "G",
        "last_name": "H",
        "student_id": 7,
        "program": "CS"
    })

    resp = client.post("/users/auth", json={
        "username": "loginuser",
        "password": "mypassword"
    })

    assert resp.status_code == 200
    body = resp.get_json()

    assert body["message"] == "Authenticated"
    assert body["user"]["username"] == "loginuser"


def test_auth_user_invalid_credentials(client):
    """
    Test authentication failure with invalid credentials.

    Ensures:
        - 401 Unauthorized.
        - Error contains correct messaging.
    """
    client.post("/users", json={
        "username": "wrongtest",
        "password": "correctpw",
        "email": "wrongtest@example.com",
        "role": "user",
        "first_name": "I",
        "last_name": "J",
        "student_id": 8,
        "program": "CS"
    })

    resp = client.post("/users/auth", json={
        "username": "wrongtest",
        "password": "wrongpw"
    })

    assert resp.status_code == 401
    body = resp.get_json()

    assert body["error"] == "Invalid username or password"


# --- UPDATE ---
def test_update_user_success(client):
    """
    Test updating a user's fields.

    Ensures:
        - PUT persists new value.
    """
    create_resp = client.post("/users", json={
        "username": "oldname",
        "password": "pw",
        "email": "old@example.com",
        "role": "user",
        "first_name": "K",
        "last_name": "L",
        "student_id": 9,
        "program": "BIO"
    })
    user_id = create_resp.get_json()["id"]

    update_resp = client.put(f"/users/{user_id}", json={"username": "newname"})
    assert update_resp.status_code == 200
    updated = update_resp.get_json()["user"]

    assert updated["username"] == "newname"


def test_update_user_not_found(client):
    """
    Test updating nonexistent user returns 404.

    Ensures:
        - Proper error is returned.
    """
    response = client.put("/users/9999", json={"username": "doesntmatter"})
    assert response.status_code == 404
    assert response.get_json()["error"] == "User not found"


def test_update_user_missing_data(client):
    """
    Test updating a user with empty payload returns 400.

    Ensures:
        - Update validation triggers.
    """
    create_resp = client.post("/users", json={
        "username": "missing",
        "password": "pw",
        "email": "missing@example.com",
        "role": "user",
        "first_name": "M",
        "last_name": "N",
        "student_id": 10,
        "program": "ENG"
    })
    user_id = create_resp.get_json()["id"]

    response = client.put(f"/users/{user_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_update_user_unique_constraint_violation(client):
    """
    Test updating a user to a duplicate email triggers unique constraint error.

    Ensures:
        - 500 response.
        - Error contains 'Failed to update user'.
    """
    u1 = client.post("/users", json={
        "username": "alpha",
        "password": "pw",
        "email": "alpha@example.com",
        "role": "user",
        "first_name": "O",
        "last_name": "P",
        "student_id": 11,
        "program": "CS"
    }).get_json()["id"]

    client.post("/users", json={
        "username": "beta",
        "password": "pw",
        "email": "beta@example.com",
        "role": "user",
        "first_name": "Q",
        "last_name": "R",
        "student_id": 12,
        "program": "MATH"
    })

    resp = client.put(f"/users/{u1}", json={"email": "beta@example.com"})
    assert resp.status_code == 500
    assert "Failed to update user" in resp.get_json()["error"]


# --- DELETE ---
def test_delete_user_success(client):
    """
    Test deleting an existing user.

    Ensures:
        - Record is removed.
        - Response returns 'User deleted'.
    """
    create_resp = client.post("/users", json={
        "username": "todelete",
        "password": "pw",
        "email": "del@example.com",
        "role": "user",
        "first_name": "S",
        "last_name": "T",
        "student_id": 13,
        "program": "BIO"
    })
    user_id = create_resp.get_json()["id"]

    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "User deleted"


def test_delete_user_not_found(client):
    """
    Test deleting nonexistent user returns 404.

    Ensures:
        - Correct error message returned.
    """
    resp = client.delete("/users/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "User not found"


def test_delete_user_internal_error(client, app):
    """
    Test database failure during deletion results in 500.

    Ensures:
        - Drop DB then call DELETE.
        - 500 returned with error.
    """
    create_resp = client.post("/users", json={
        "username": "crash",
        "password": "pw",
        "email": "crash@example.com",
        "role": "user",
        "first_name": "U",
        "last_name": "V",
        "student_id": 14,
        "program": "CS"
    })
    user_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    resp = client.delete(f"/users/{user_id}")
    assert resp.status_code == 500
    assert "Failed" in resp.get_json()["error"]
