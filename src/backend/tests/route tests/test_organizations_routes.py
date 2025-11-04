import pytest
from db import db
from routes import organization_routes


@pytest.fixture(autouse=True)
def setup_routes(app):
    organization_routes.register_routes(app)


# - CREATE -
def test_create_organization_success(client):
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
    response = client.post("/organizations", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_create_organization_null_constraint_violation(client):
    data = {"title": None, "description": "Invalid org"}
    resp = client.post("/organizations", json=data)
    assert resp.status_code == 500
    assert "Failed to create organization" in resp.get_json()["error"]


# - READ -
def test_get_all_organizations(client):
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
    with app.app_context():
        db.drop_all()

    response = client.get("/organizations")
    assert response.status_code == 500
    body = response.get_json()
    assert "Failed to fetch organizations" in body["error"]


def test_get_organization_by_id_success(client):
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
    response = client.get("/organizations/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Organization not found"


def test_get_organization_by_id_internal_error(client, app):
    create_resp = client.post("/organizations", json={
        "title": "Temp Org"
    })
    org_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    response = client.get(f"/organizations/{org_id}")
    assert response.status_code == 500
    assert "Failed to fetch organization" in response.get_json()["error"]


# - UPDATE -
def test_update_organization_success(client):
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
    response = client.put("/organizations/9999", json={"title": "Nope"})
    assert response.status_code == 404
    assert response.get_json()["error"] == "Organization not found"


def test_update_organization_missing_data(client):
    create_resp = client.post("/organizations", json={
        "title": "Update Missing"
    })
    org_id = create_resp.get_json()["id"]

    response = client.put(f"/organizations/{org_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing data"


def test_update_organization_internal_error(client, app):
    create_resp = client.post("/organizations", json={
        "title": "Crash Org"
    })
    org_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    response = client.put(f"/organizations/{org_id}", json={"title": "New Title"})
    assert response.status_code == 500
    assert "Failed to update organization" in response.get_json()["error"]


# - DELETE -
def test_delete_organization_success(client):
    create_resp = client.post("/organizations", json={
        "title": "Delete Me"
    })
    org_id = create_resp.get_json()["id"]

    response = client.delete(f"/organizations/{org_id}")
    assert response.status_code == 200
    assert response.get_json()["message"] == "Organization deleted"


def test_delete_organization_not_found(client):
    response = client.delete("/organizations/9999")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Organization not found"


def test_delete_organization_internal_error(client, app):
    create_resp = client.post("/organizations", json={
        "title": "Fail Delete"
    })
    org_id = create_resp.get_json()["id"]

    with app.app_context():
        db.drop_all()

    response = client.delete(f"/organizations/{org_id}")
    assert response.status_code == 500
    assert "Failed to delete organization" in response.get_json()["error"]
