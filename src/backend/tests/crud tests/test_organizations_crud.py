import pytest
from db.crud import crud_organization
from db.models import Organization
from db import db

@pytest.fixture
def sample_org_data():
    """
    Fixture providing a valid sample organization payload.

    Returns:
        dict: A dictionary containing fields required to create an Organization.
    """
    return {
        "title": "Test Org",
        "description": "A test organization",
        "status": "active"
    }


def test_create_organization(session, sample_org_data):
    """
    Test creating a new organization record.

    Steps:
        1. Create an organization using valid sample data.
        2. Retrieve it from the database.
        3. Assert that key fields match expected values.

    Ensures:
        - Organization creation works.
        - Data persists correctly in the database.
    """
    org_id = crud_organization.create_organization(sample_org_data)
    assert org_id is not None

    org = db.session.get(Organization, org_id)
    assert org.title == "Test Org"
    assert org.status == "active"


def test_get_organization_by_id(session, sample_org_data):
    """
    Test retrieving an organization by ID.

    Steps:
        1. Create a sample organization.
        2. Retrieve it via `get_organization`.
        3. Assert returned values match the created data.

    Ensures:
        - Organization lookup by ID functions properly.
    """
    org_id = crud_organization.create_organization(sample_org_data)
    result = crud_organization.get_organization(org_id)

    assert result["title"] == "Test Org"
    assert result["status"] == "active"


def test_get_organization_by_id_not_found(session):
    """
    Test that retrieving a non-existent organization returns None.

    Ensures:
        - Missing organization IDs are handled gracefully.
    """
    result = crud_organization.get_organization(9999)
    assert result is None


def test_get_all_organizations(session, sample_org_data):
    """
    Test retrieving all organizations from the database.

    Steps:
        1. Create two organizations.
        2. Retrieve all organizations.
        3. Assert correct count and data integrity.

    Ensures:
        - Bulk retrieval of organizations works.
        - Newly created organizations appear in the list.
    """
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
    """
    Test updating an existing organization.

    Steps:
        1. Create an organization.
        2. Update its title.
        3. Confirm the update persisted in the database.

    Ensures:
        - Update operations correctly modify organization records.
    """
    org_id = crud_organization.create_organization(sample_org_data)
    crud_organization.update_organization(org_id, {"title": "Updated Org"})

    updated = db.session.get(Organization, org_id)
    assert updated.title == "Updated Org"


def test_update_nonexistent_organization(session):
    """
    Test updating an organization that does not exist.

    Ensures:
        - CRUD returns None when the target cannot be found.
        - No exception is raised for missing records.
    """
    result = crud_organization.update_organization(9999, {"title": "No Org"})
    assert result is None


def test_delete_organization(session, sample_org_data):
    """
    Test deleting an existing organization.

    Steps:
        1. Create an organization.
        2. Delete it.
        3. Verify deletion returns True.
        4. Check that the record is removed from persistence.

    Ensures:
        - Delete operation successfully removes the entity.
    """
    org_id = crud_organization.create_organization(sample_org_data)
    assert crud_organization.delete_organization(org_id) is True
    assert db.session.get(Organization, org_id) is None


def test_delete_nonexistent_organization(session):
    """
    Test deleting an organization that does not exist.

    Ensures:
        - CRUD returns False instead of raising errors.
    """
    assert crud_organization.delete_organization(9999) is False
