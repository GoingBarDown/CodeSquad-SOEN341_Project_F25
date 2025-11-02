from db.models import Organization
from db import db

def get_all_organizations():
    try:
        organizations = db.session.query(Organization).all()
        return [org.data for org in organizations]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organizations: {e}")

def get_organization(org_id):
    try:
        org = db.session.get(Organization, org_id)
        return org.data if org else None
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organization {org_id}: {e}")

def create_organization(data):
    try:
        new_org = Organization(**data)
        db.session.add(new_org)
        db.session.commit()
        return new_org.id
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create organization: {e}")

def update_organization(org_id, data):
    try:
        org = db.session.get(Organization, org_id)
        if not org:
            return None
        for key, value in data.items():
            if hasattr(org, key):
                setattr(org, key, value)
        db.session.commit()
        return org.data
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update organization {org_id}: {e}")

def delete_organization(org_id):
    try:
        org = db.session.get(Organization, org_id)
        if not org:
            return False
        db.session.delete(org)
        db.session.commit()
        return True
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to delete organization {org_id}: {e}")
