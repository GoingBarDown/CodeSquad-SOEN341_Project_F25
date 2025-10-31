from db.models import OrganizationMember
from db import db

def get_all_organization_members():
    try:
        members = db.session.query(OrganizationMember).all()
        return [member.data for member in members]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organization members: {e}")

def get_organization_member(organization_id, user_id):
    try:
        member = db.session.query(OrganizationMember).filter_by(
            organization_id=organization_id, user_id=user_id
        ).first()
        if not member:
            raise ValueError(f"Organization member with org_id={organization_id} and user_id={user_id} not found.")
        return member.data
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organization member: {e}")

def create_organization_member(data):
    try:
        new_member = OrganizationMember(**data)
        db.session.add(new_member)
        db.session.commit()
        return {"organization_id": new_member.organization_id, "user_id": new_member.user_id}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create organization member: {e}")

def delete_organization_member(organization_id, user_id):
    try:
        member = db.session.query(OrganizationMember).filter_by(
            organization_id=organization_id, user_id=user_id
        ).first()
        if not member:
            raise ValueError(f"Organization member with org_id={organization_id} and user_id={user_id} not found.")
        db.session.delete(member)
        db.session.commit()
        return True
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to delete organization member: {e}")

def update_organization_member(organization_id, user_id, data):
    try:
        member = db.session.query(OrganizationMember).filter_by(
            organization_id=organization_id, user_id=user_id
        ).first()
        if not member:
            raise ValueError(f"Organization member with org_id={organization_id} and user_id={user_id} not found.")
        for key, value in data.items():
            if hasattr(member, key):
                setattr(member, key, value)
        db.session.commit()
        return member.data
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update organization member: {e}")
