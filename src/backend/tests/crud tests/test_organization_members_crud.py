import pytest
from db.crud import crud_organization_member, crud_organization, crud_users
from db.models import OrganizationMember
from db import db

@pytest.fixture
def setup_user_and_org():
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
    user_id, org_id = setup_user_and_org
    data = {"organization_id": org_id, "user_id": user_id}
    result = crud_organization_member.create_organization_member(data)

    assert result["organization_id"] == org_id
    assert result["user_id"] == user_id

    member = db.session.get(OrganizationMember, (org_id, user_id))
    assert member is not None

def test_get_organization_member(session, setup_user_and_org):
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
    user_id, org_id = setup_user_and_org
    result = crud_organization_member.get_organization_member(org_id, 9999)
    assert result is None

def test_get_all_organization_members(session, setup_user_and_org):
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    members = crud_organization_member.get_all_organization_members()
    assert len(members) >= 1
    assert any(m["organization_id"] == org_id for m in members)

def test_update_organization_member(session, setup_user_and_org):
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    updated = crud_organization_member.update_organization_member(org_id, user_id, {
        "organization_id": org_id,  # even though no real change, still valid
        "user_id": user_id
    })

    assert updated is not None
    assert updated["organization_id"] == org_id

def test_update_nonexistent_organization_member(session, setup_user_and_org):
    user_id, org_id = setup_user_and_org
    result = crud_organization_member.update_organization_member(org_id, 9999, {"user_id": 9999})
    assert result is None

def test_delete_organization_member(session, setup_user_and_org):
    user_id, org_id = setup_user_and_org
    crud_organization_member.create_organization_member({
        "organization_id": org_id,
        "user_id": user_id
    })

    deleted = crud_organization_member.delete_organization_member(org_id, user_id)
    assert deleted is True
    assert db.session.get(OrganizationMember, (org_id, user_id)) is None

def test_delete_nonexistent_organization_member(session, setup_user_and_org):
    user_id, org_id = setup_user_and_org
    result = crud_organization_member.delete_organization_member(org_id, 9999)
    assert result is False
