from db.models import Organization
from db import db

def get_all_organizations():
    organizations = Organization.query.all()
    return [org.data for org in organizations]

def get_organization(org_id):
    org = Organization.query.get(org_id)
    return org.data if org else None

def create_organization(data):
    new_org = Organization(**data)
    db.session.add(new_org)
    db.session.commit()
    return new_org.id  # Or new_org.data for the full dict

def update_organization(org_id, data):
    org = Organization.query.get(org_id)
    if not org:
        return None
    for key, value in data.items():
        if hasattr(org, key):
            setattr(org, key, value)
    db.session.commit()
    return org.data

def delete_organization(org_id):
    org = Organization.query.get(org_id)
    if org:
        db.session.delete(org)
        db.session.commit()
        return True
    else:
        return False