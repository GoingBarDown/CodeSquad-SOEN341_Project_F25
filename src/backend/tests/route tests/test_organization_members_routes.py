import pytest
from db import db
from routes import organization_members_routes
from db.crud import crud_users, crud_organization, crud_organization_member

@pytest.fixture(autouse=True)
def setup_routes(app):
    """
    Automatically registers the organization member routes for all tests.

    Ensures:
        - Each test has access to the full API route surface for
          organization member operations.
    """
    organization_members_routes.register_routes(app)


# Helper functions to create mock objects

def create_user(username="testuser", email="test@example.com"):
    """
    Helper function to create a mock user directly via the CRUD layer.

    Parameters:
        username (str): Username for the new user.
        email (str): Email for the new user.

    Returns:
        int: Newly created user's ID.
    """
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
    """
    Helper function to create a mock organization.

    Parameters:
        title (str): Name of the organization.

    Returns:
        int: Newly created organization's ID.
    """
    return crud_organization.create_organization({"title": title, "status": "active"})


# ----------------------------
# CREATE
# ----------------------------

def test_add_org_member_success(client):
    """
    Test creating a new organization member with valid data.

    Steps:
        1. Create a user and an organization.
        2. POST a membership linking them.
        3. Assert persistence and response message.

    Ensures:
        - Membership creation works.
        - Correct organization ID is stored.
    """
    user_id = create_user()
    org_id = create_org()
    resp = client.post("/organization_members", json={"organization_id": org_id, "user_id": user_id})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["message"] == "Organization member created"
    assert data["member"]["organization_id"] == org_id


def test_add_org_member_missing_data(client):
    """
    Test that creating a member with missing JSON fields returns 400.

    Ensures:
        - Validation layer rejects empty payloads.
    """
    resp = client.post("/organization_members", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing data"


# ----------------------------
# READ ALL
# ----------------------------

def test_get_all_org_members(client):
    """
    Test retrieving all organization members.

    Steps:
        1. Create a user and organization.
        2. Insert a membership.
        3. GET /organization_members.
        4. Assert one record is returned.

    Ensures:
        - Basic list retrieval works.
        - Returned data matches expected user_id.
    """
    user_id = create_user("u1", "u1@test.com")
    org_id = create_org("O1")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.get("/organization_members")
    assert resp.status_code == 200
    body = resp.get_json()
    assert len(body) == 1
    assert body[0]["user_id"] == user_id


def test_get_all_org_members_internal_error(client, app):
    """
    Test that internal database errors surface as 500.

    Steps:
        1. Drop all tables inside app context.
        2. Attempt to fetch organization members.

    Ensures:
        - Internal failure is correctly mapped to 500.
    """
    with app.app_context():
        db.drop_all()
    resp = client.get("/organization_members")
    assert resp.status_code == 500
    assert "error" in resp.get_json()


# ----------------------------
# READ ONE
# ----------------------------

def test_get_org_member_success(client):
    """
    Test retrieving a specific organization member by composite key.

    Steps:
        1. Create user + organization.
        2. Insert membership.
        3. GET /organization_members/<org>/<user>.

    Ensures:
        - Successful lookup returns correct member data.
    """
    user_id = create_user("u2", "u2@test.com")
    org_id = create_org("O2")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.get(f"/organization_members/{org_id}/{user_id}")
    assert resp.status_code == 200
    assert resp.get_json()["user_id"] == user_id


def test_get_org_member_not_found(client):
    """
    Test that looking up a nonexistent organization member returns 404.

    Ensures:
        - Missing composite key results in proper error code.
    """
    resp = client.get("/organization_members/9999/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Organization member not found"


# ----------------------------
# UPDATE
# ----------------------------

def test_update_org_member_success(client):
    """
    Test updating an existing organization member.

    Steps:
        1. Insert a membership.
        2. Update the member's role.
        3. Assert success message.

    Ensures:
        - Update endpoint properly persists modifications.
    """
    user_id = create_user("u3", "u3@test.com")
    org_id = create_org("O3")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.put(f"/organization_members/{org_id}/{user_id}", json={"role": "admin"})
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Member updated"


def test_update_org_member_missing_data(client):
    """
    Test updating a member with empty JSON payload returns 400.

    Ensures:
        - Missing required update fields are detected.
    """
    resp = client.put("/organization_members/1/1", json={})
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Missing data"


def test_update_org_member_not_found(client):
    """
    Test updating a nonexistent member returns 404.

    Ensures:
        - Proper handling of invalid composite keys.
    """
    resp = client.put("/organization_members/9999/9999", json={"role": "x"})
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Organization member not found"


# ----------------------------
# DELETE
# ----------------------------

def test_delete_org_member_success(client):
    """
    Test deleting an organization member.

    Steps:
        1. Create membership.
        2. DELETE it through API.
        3. Assert 200 + confirmation message.

    Ensures:
        - Delete operation successfully removes the record.
    """
    user_id = create_user("u4", "u4@test.com")
    org_id = create_org("O4")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    resp = client.delete(f"/organization_members/{org_id}/{user_id}")
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Organization member deleted"


def test_delete_org_member_not_found(client):
    """
    Test deleting a nonexistent organization member returns 404.

    Ensures:
        - Endpoint properly indicates missing records.
    """
    resp = client.delete("/organization_members/9999/9999")
    assert resp.status_code == 404
    assert resp.get_json()["error"] == "Organization member not found"


def test_delete_org_member_internal_error(client, app):
    """
    Test that internal database failure during deletion produces a 500.

    Steps:
        1. Create membership.
        2. Drop DB to force internal error.
        3. Attempt deletion.

    Ensures:
        - Unexpected backend failures map to 500.
    """
    user_id = create_user("u5", "u5@test.com")
    org_id = create_org("O5")
    crud_organization_member.create_organization_member({"organization_id": org_id, "user_id": user_id})
    with app.app_context():
        db.drop_all()
    resp = client.delete(f"/organization_members/{org_id}/{user_id}")
    assert resp.status_code == 500
    assert "error" in resp.get_json()
