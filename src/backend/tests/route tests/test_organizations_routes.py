import pytest
from db import db
from routes import organization_routes


@pytest.fixture(autouse=True)
def setup_routes(app):
    """
    Automatically registers the organization routes for all tests.

    Ensures:
        - Each test has access to the full API route surface for
          organization operations.
    """
    organization_routes.register_routes(app)


# ----------------------------
# CREATE
# ----------------------------

def test_create_organization_success(client):
    """
    Test creating a new organization with valid data.

    Steps:
        1. POST a new organization with required fields.
        2. Validate 201 response, success message, and returned ID.

    Ensures:
        - Organization creation endpoints work end-to-end.
        - Response payload includes a generated ID.
    """
    data = {
        "title": "New Org",
        "description": "Test organization",
        "status": "active"
    }
    response = client.post("/organizations", json=data)

    assert response.status_code == 201
    body = response.get_json()
    assert body["message"] == "Organization created"
    assert "id" in body


def test_create_organization_missing_data(client):
    """
    Test that sending an empty payload to the create endpoint returns 400.

    Ensures:
        - Validation logic properly detects missing required fields.
    """
    response = client.post("/organizations", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_create_organization_null_constraint_violation(client):
    """
    Test that violating NOT NULL database constraints results in 500.

    Steps:
        - POST an organization with a null title.
        - Expect a server error indicating failure to create.

    Ensures:
        - Underlying DB integrity errors surface as 500-level failures.
    """
    data = {"title": None, "description": "Invalid org"}
    resp = client.post("/organizations", json=data)
    assert resp.status_code == 500
    assert "Failed to create organization" in resp.get_json()["error"]


# ----------------------------
# READ
# ----------------------------

def test_get_all_organizations(client):
    """
    Test retrieving all organizations.

    Steps:
        1. Insert two organizations.
        2. GET /organizations.
        3. Assert both are returned.

    Ensures:
        - Basic list retrieval returns all existing records.
        - Returned list contains expected data.
    """
    client.post("/organizations", json={
        "title": "Org 1",
        "status": "active"
    })
    client.post("/organizations", json={
        "title": "Org 2",
        "status": "inactive"
    })

    response = client.get("/organizations")
    assert response.status_code == 200
    orgs = response.get_json()
    assert len(orgs) == 2
    assert any(o["title"] == "Org 2" for o in orgs)


def test_get_all_organizations_internal_error(client, app):
    """
    Test that internal DB failure returns 500 during list fetch.

    Steps:
        - Drop all tables.
        - GET /organizations.

    Ensures:
        - Internal errors are propagated as 500 responses.
    """
    with app.app_context():
        db.drop_all()

    response = client.get("/organizations")
    assert response.status_code == 500
    body = response.get_json()
    assert "Failed to fetch organizations" in body["error"]


def test_get_organization_by_id_success(client):
    """
    Test fetching a single organization by valid ID.

    Steps:
        - Create an organization.
        - Fetch it via /organizations/<id>.
        - Assert record matches created data.

    Ensures:
        - Successful entity lookup works.
    """
    create_resp = client.post("/organizations", json={
        "title": "Find Org",
        "status": "active"
    })
    org_id = create_resp.get_json()["id"]

    response = client.get(f"/organizations/{org_id}")
    assert response.status_code == 200
    org = response.get_json()
    assert org["title"] == "Find Org"


def test_get_organization_by_id_not_found(client):
    """
    Test that fetching a nonexistent organization returns 404.

    Ensures:
        - Proper handling of nonexistent IDs.
    """
    response = client.get("/organizations/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Organization not found"


def test_get_organization_by_id_internal_error(client, app):
    """
    Test that internal DB failure produces 500 during single fetch.

    Steps:
        - Create an organization.
        - Drop tables to trigger failure.
        - Request the organization by ID.

    Ensures:
        - Unexpected backend errors map to 500 responses.
    """
    create_resp = client.post("/organizations", json={
        "title": "Temp Org"
    })
    org_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/organizations/{org_id}")
    assert response.status_code == 500
    assert "Failed to fetch organization" in response.get_json()["error"]


# ----------------------------
# UPDATE
# ----------------------------

def test_update_organization_success(client):
    """
    Test updating an existing organization.

    Steps:
        1. Create organization.
        2. Update title via PUT.
        3. Verify updated fields.

    Ensures:
        - Update endpoint persists changes correctly.
    """
    create_resp = client.post("/organizations", json={
        "title": "Old Org",
        "status": "active"
    })
    org_id = create_resp.get_json()["id"]

    update_resp = client.put(f"/organizations/{org_id}", json={"title": "Updated Org"})
    assert update_resp.status_code == 200
    updated = update_resp.get_json()["organization"]
    assert updated["title"] == "Updated Org"


def test_update_organization_not_found(client):
    """
    Test updating a nonexistent organization returns 404.

    Ensures:
        - Correct error code for invalid IDs.
    """
    response = client.put("/organizations/9999", json={"title": "Nope"})
    assert response.status_code == 404
    assert response.get_json()["error"] == "Organization not found"


def test_update_organization_missing_data(client):
    """
    Test PUT with empty JSON payload returns 400.

    Ensures:
        - Update endpoint validates provided fields.
    """
    create_resp = client.post("/organizations", json={
        "title": "Update Missing"
    })
    org_id = create_resp.get_json()["id"]

    response = client.put(f"/organizations/{org_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_update_organization_internal_error(client, app):
    """
    Test that internal DB failure during update returns 500.

    Steps:
        - Create organization.
        - Drop DB.
        - Attempt update.

    Ensures:
        - Internal issues are mapped to 500 responses.
    """
    create_resp = client.post("/organizations", json={
        "title": "Crash Org"
    })
    org_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    response = client.put(f"/organizations/{org_id}", json={"title": "New Title"})
    assert response.status_code == 500
    assert "Failed to update organization" in response.get_json()["error"]


# ----------------------------
# DELETE
# ----------------------------

def test_delete_organization_success(client):
    """
    Test deleting an existing organization.

    Steps:
        - Create organization.
        - DELETE it.
        - Validate success message.

    Ensures:
        - Delete endpoint removes the record and returns 200.
    """
    create_resp = client.post("/organizations", json={
        "title": "Delete Me"
    })
    org_id = create_resp.get_json()["id"]

    response = client.delete(f"/organizations/{org_id}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "Organization deleted"


def test_delete_organization_not_found(client):
    """
    Test deleting a nonexistent organization returns 404.

    Ensures:
        - Proper reporting of invalid IDs.
    """
    response = client.delete("/organizations/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Organization not found"


def test_delete_organization_internal_error(client, app):
    """
    Test that internal DB failure during deletion produces 500.

    Steps:
        - Create organization.
        - Drop DB.
        - Attempt DELETE.

    Ensures:
        - Backend deletion errors surface correctly as 500.
    """
    create_resp = client.post("/organizations", json={
        "title": "Fail Delete"
    })
    org_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    response = client.delete(f"/organizations/{org_id}")
    assert response.status_code == 500
    assert "Failed to delete organization" in response.get_json()["error"]
