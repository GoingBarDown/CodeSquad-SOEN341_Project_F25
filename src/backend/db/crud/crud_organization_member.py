from db.models import OrganizationMember
from db import db

def get_all_organization_members():
    members = OrganizationMember.query.all()
    return [member.data for member in members]

def create_organization_member(data):
    new_member = OrganizationMember(**data)
    db.session.add(new_member)
    db.session.commit()
    return {"organization_id": new_member.organization_id, "user_id": new_member.user_id}

def get_organization_member(organization_id, user_id):
    member = OrganizationMember.query.filter_by(organization_id=organization_id, user_id=user_id).first()
    return member.data if member else None

def delete_organization_member(organization_id, user_id):
    member = OrganizationMember.query.filter_by(organization_id=organization_id, user_id=user_id).first()
    if member:
        db.session.delete(member)
        db.session.commit()
        return True
    else:
        return False