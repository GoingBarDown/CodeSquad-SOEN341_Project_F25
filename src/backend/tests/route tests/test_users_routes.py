import pytest
from db import db
from db.models import User
from routes import users_routes

@pytest.fixture(autouse=True)
def setup_routes(app):
    users_routes.register_routes(app)

def test_create_user_success(client):
    data = {
        "username": "newuser",
        "password": "securepassword",
        "email": "new@example.com",
        "role": "user"
    }
    response = client.post("/users", json=data)

    assert response.status_code == 201
    body = response.get_json()
    assert body["message"] == "User created"
    assert "id" in body

def test_create_user_missing_data(client):
    response = client.post("/users", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"

def test_create_user_null_constraint_violation(client):
    data = {
        "username": None,
        "password": "pw",
        "email": "bad@example.com",
        "role": "user"
    }
    resp = client.post("/users", json=data)
    assert resp.status_code == 500
    assert "Failed to create user" in resp.get_json()["error"]

def test_create_user_unique_constraint_violation(client):
    data = {
        "username": "dupe",
        "password": "pw",
        "email": "dupe@example.com",
        "role": "user"
    }
    client.post("/users", json=data)

    resp = client.post("/users", json=data)
    assert resp.status_code == 500
    assert "Failed to create user" in resp.get_json()["error"]

def test_get_all_users(client):
    client.post("/users", json={
        "username": "u1",
        "password": "p1",
        "email": "u1@example.com",
        "role": "user"
    })
    client.post("/users", json={
        "username": "u2",
        "password": "p2",
        "email": "u2@example.com",
        "role": "admin"
    })

    response = client.get("/users")
    assert response.status_code == 200
    users = response.get_json()
    assert len(users) == 2
    assert any(u["username"] == "u2" for u in users)

def test_get_all_users_internal_error(client, app):
    with app.app_context():
        db.drop_all()

    response = client.get("/users")

    assert response.status_code == 500
    body = response.get_json()
    assert "Failed to retrieve users" in body["error"]


def test_get_user_by_id_success(client):
    create_resp = client.post("/users", json={
        "username": "findme",
        "password": "pass",
        "email": "find@example.com",
        "role": "user"
    })
    user_id = create_resp.get_json()["id"]

    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    user = response.get_json()
    assert user["username"] == "findme"

def test_get_user_by_id_not_found(client):
    response = client.get("/users/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "User not found"

def test_get_user_by_id_internal_error(client, app):
    with app.app_context():
        db.drop_all()

    response = client.get("/users/1")
    assert response.status_code == 500
    assert "Failed to retrieve user" in response.get_json()["error"]


def test_update_user_success(client):
    create_resp = client.post("/users", json={
        "username": "oldname",
        "password": "pw",
        "email": "old@example.com",
        "role": "user"
    })
    user_id = create_resp.get_json()["id"]

    update_resp = client.put(f"/users/{user_id}", json={"username": "newname"})
    assert update_resp.status_code == 200
    updated = update_resp.get_json()["user"]
    assert updated["username"] == "newname"

def test_update_user_not_found(client):
    response = client.put("/users/9999", json={"username": "doesntmatter"})
    assert response.status_code == 404
    assert response.get_json()["error"] == "User not found"

def test_update_user_missing_data(client):
    create_resp = client.post("/users", json={
        "username": "missing",
        "password": "pw",
        "email": "missing@example.com",
        "role": "user"
    })
    user_id = create_resp.get_json()["id"]

    response = client.put(f"/users/{user_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"

def test_update_user_unique_constraint_violation(client):
    u1 = client.post("/users", json={
        "username": "alpha",
        "password": "pw",
        "email": "alpha@example.com",
        "role": "user"
    }).get_json()["id"]

    client.post("/users", json={
        "username": "beta",
        "password": "pw",
        "email": "beta@example.com",
        "role": "user"
    })

    resp = client.put(f"/users/{u1}", json={"email": "beta@example.com"})
    assert resp.status_code == 500
    assert "Failed to update user" in resp.get_json()["error"]

def test_delete_user_success(client):
    create_resp = client.post("/users", json={
        "username": "todelete",
        "password": "pw",
        "email": "del@example.com",
        "role": "user"
    })
    user_id = create_resp.get_json()["id"]

    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "User deleted"

def test_delete_user_not_found(client):
    response = client.delete("/users/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "User not found"

def test_delete_user_db_failure(client, app):
    r = client.post("/users", json={
        "username": "crash",
        "password": "pw",
        "email": "crash@example.com",
        "role": "user"
    })
    uid = r.get_json()["id"]

    with app.app_context():
        db.drop_all()

    resp = client.delete(f"/users/{uid}")
    assert resp.status_code == 500
    assert "Failed to delete user" in resp.get_json()["error"]