import pytest
from db import db
from routes import organization_members_routes
from db.crud import crud_users, crud_organization, crud_organization_member

@pytest.fixture(autouse=True)
def setup_routes(app):
    organization_members_routes.register_routes(app)

# helper functions to create mock user and organization
def create_user(username="testuser", email="test@example.com"):
    return crud_users.create_user({
        "username": username,
        "password": "pass",
        "email": email,
        "role": "user",
        "first_name": "Test",
        "last_name": "User",
        "student_id": int(hash(username) % 100000),
        "program": "CS"
    })
def create_org(title="Test Org"):
    return crud_organization.create_organization({"title": title, "status": "active"})

# CREATE

def test_add_org_member_success(client):
    user_id = create_user()
    org_id = create_org()
    resp = client.post("/organization_members", json={"organization_id": org_id, "user_id": user_id})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["message"] == "Organization member created"
    assert data["member"]["organization_id"] == org_id


def test_add_org_member_missing_data(client):
    resp = client.post("/organization_members", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing data"


# READ ALL

def test_get_all_org_members(client):
    user_id = create_user("u1", "u1@test.com")
    org_id = create_org("O1")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.get("/organization_members")
    assert resp.status_code == 200
    body = resp.get_json()
    assert len(body) == 1
    assert body[0]["user_id"] == user_id


def test_get_all_org_members_internal_error(client, app):
    with app.app_context(): db.drop_all()
    resp = client.get("/organization_members")
    assert resp.status_code == 500
    assert "error" in resp.get_json()


# READ ONE

def test_get_org_member_success(client):
    user_id = create_user("u2", "u2@test.com")
    org_id = create_org("O2")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.get(f"/organization_members/{org_id}/{user_id}")
    assert resp.status_code == 200
    assert resp.get_json()["user_id"] == user_id


def test_get_org_member_not_found(client):
    resp = client.get("/organization_members/9999/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Organization member not found"


# UPDATE

def test_update_org_member_success(client):
    user_id = create_user("u3", "u3@test.com")
    org_id = create_org("O3")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.put(f"/organization_members/{org_id}/{user_id}", json={"role": "admin"})
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Member updated"


def test_update_org_member_missing_data(client):
    resp = client.put("/organization_members/1/1", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing data"


def test_update_org_member_not_found(client):
    resp = client.put("/organization_members/9999/9999", json={"role": "x"})
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Organization member not found"


# DELETE

def test_delete_org_member_success(client):
    user_id = create_user("u4", "u4@test.com")
    org_id = create_org("O4")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.delete(f"/organization_members/{org_id}/{user_id}")
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Organization member deleted"


def test_delete_org_member_not_found(client):
    resp = client.delete("/organization_members/9999/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Organization member not found"


def test_delete_org_member_internal_error(client, app):
    user_id = create_user("u5", "u5@test.com")
    org_id = create_org("O5")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    with app.app_context(): db.drop_all()
    resp = client.delete(f"/organization_members/{org_id}/{user_id}")
    assert resp.status_code == 500
    assert "error" in resp.get_json()
