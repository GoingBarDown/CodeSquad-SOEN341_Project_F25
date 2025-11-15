import pytest
from db.crud import crud_organization_member, crud_organization, crud_users
from db.models import OrganizationMember
from db import db

@pytest.fixture
def setup_user_and_org():
    """
    Fixture that creates a test user and a test organization,
    returning their respective IDs.

    This fixture is used to ensure that organization member operations
    always have valid foreign key references.

    Returns: tuple: (user_id, organization_id)
    """
    user_id = crud_users.create_user({
        "username": "memberuser",
        "password": "pass123",
        "email": "member@example.com",
        "role": "user"
    })
    org_id = crud_organization.create_organization({
        "title": "Member Org",
        "description": "Test Org for members",
        "status": "active"
    })
    return user_id, org_id


def test_create_organization_member(session, setup_user_and_org):
    """
    Test creating a new organization-member relationship.

    Steps:
        1. Use fixture to obtain a valid user and organization.
        2. Create a membership relation using CRUD.
        3. Validate returned data.
        4. Verify that the relationship exists in the database.

    Ensures:
        - A valid membership entry is persisted.
    """
    user_id, org_id = setup_user_and_org
    data = {"organization_id": org_id, "user_id": user_id}
    result = crud_organization_member.create_organization_member(data)

    assert result["organization_id"] == org_id
    assert result["user_id"] == user_id

    member = db.session.get(OrganizationMember, (org_id, user_id))
    assert member is not None


def test_get_organization_member(session, setup_user_and_org):
    """
    Test retrieving an existing organization-member relationship.

    Steps:
        1. Create a membership relation.
        2. Fetch the relation using its composite key.
        3. Assert that valid data is returned.

    Ensures:
        - Membership lookup works correctly.
    """
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    result = crud_organization_member.get_organization_member(org_id, user_id)
    assert result is not None
    assert result["organization_id"] == org_id
    assert result["user_id"] == user_id


def test_get_organization_member_not_found(session, setup_user_and_org):
    """
    Test that retrieving a non-existent membership returns None.

    Ensures:
        - The CRUD layer safely handles lookups of missing records.
    """
    user_id, org_id = setup_user_and_org
    result = crud_organization_member.get_organization_member(org_id, 9999)
    assert result is None


def test_get_all_organization_members(session, setup_user_and_org):
    """
    Test retrieving all organization-member entries.

    Steps:
        1. Create a membership record.
        2. Retrieve all membership entries.
        3. Assert at least one entry exists.
        4. Verify the created entry is included.

    Ensures:
        - Bulk retrieval works as intended.
    """
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    members = crud_organization_member.get_all_organization_members()
    assert len(members) >= 1
    assert any(m["organization_id"] == org_id for m in members)


def test_update_organization_member(session, setup_user_and_org):
    """
    Test updating an existing organization-member relationship.

    Notes:
        - Even though the test performs a no-op update (same values),
          it still validates that update operations succeed.

    Steps:
        1. Create a membership relation.
        2. Update the relation using CRUD.
        3. Assert returned object is valid and unchanged fields are preserved.
    """
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    updated = crud_organization_member.update_organization_member(org_id, user_id, {
        "organization_id": org_id,
        "user_id": user_id
    })

    assert updated is not None
    assert updated["organization_id"] == org_id


def test_update_nonexistent_organization_member(session, setup_user_and_org):
    """
    Test updating a non-existent membership entry.

    Ensures:
        - Update operation returns None when the target does not exist.
    """
    user_id, org_id = setup_user_and_org
    result = crud_organization_member.update_organization_member(org_id, 9999, {"user_id": 9999})
    assert result is None


def test_delete_organization_member(session, setup_user_and_org):
    """
    Test deleting an existing organization-member relationship.

    Steps:
        1. Create a membership entry.
        2. Delete it via CRUD.
        3. Confirm that deletion returns True.
        4. Confirm database no longer contains the entry.

    Ensures:
        - Deletion works and the record is removed.
    """
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    deleted = crud_organization_member.delete_organization_member(org_id, user_id)
    assert deleted is True
    assert db.session.get(OrganizationMember, (org_id, user_id)) is None


def test_delete_nonexistent_organization_member(session, setup_user_and_org):
    """
    Test deleting a non-existent membership entry.

    Ensures:
        - CRUD returns False instead of raising errors when nothing is deleted.
    """
    user_id, org_id = setup_user_and_org
    result = crud_organization_member.delete_organization_member(org_id, 9999)
    assert result is False
