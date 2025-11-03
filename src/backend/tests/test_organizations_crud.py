import pytest
from db.crud import crud_organization
from db.models import Organization
from db import db

@pytest.fixture
def sample_org_data():
    return {
        "title": "Test Org",
        "description": "A test organization",
        "status": "active"
    }

def test_create_organization(session, sample_org_data):
    org_id = crud_organization.create_organization(sample_org_data)
    assert org_id is not None

    org = db.session.get(Organization, org_id)
    assert org.title == "Test Org"
    assert org.status == "active"

def test_get_organization_by_id(session, sample_org_data):
    org_id = crud_organization.create_organization(sample_org_data)
    result = crud_organization.get_organization(org_id)

    assert result["title"] == "Test Org"
    assert result["status"] == "active"

def test_get_organization_by_id_not_found(session):
    result = crud_organization.get_organization(9999)
    assert result is None

def test_get_all_organizations(session, sample_org_data):
    crud_organization.create_organization(sample_org_data)
    crud_organization.create_organization({
        "title": "Another Org",
        "description": "Second org",
        "status": "inactive"
    })

    orgs = crud_organization.get_all_organizations()
    assert len(orgs) == 2
    assert any(o["title"] == "Another Org" for o in orgs)

def test_update_organization(session, sample_org_data):
    org_id = crud_organization.create_organization(sample_org_data)
    crud_organization.update_organization(org_id, {"title": "Updated Org"})

    updated = db.session.get(Organization, org_id)
    assert updated.title == "Updated Org"

def test_update_nonexistent_organization(session):
    result = crud_organization.update_organization(9999, {"title": "No Org"})
    assert result is None

def test_delete_organization(session, sample_org_data):
    org_id = crud_organization.create_organization(sample_org_data)
    assert crud_organization.delete_organization(org_id) is True
    assert db.session.get(Organization, org_id) is None

def test_delete_nonexistent_organization(session):
    assert crud_organization.delete_organization(9999) is False
