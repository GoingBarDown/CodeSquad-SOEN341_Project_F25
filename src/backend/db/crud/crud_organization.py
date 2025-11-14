from db.models import Organization
from db import db

def get_all_organizations():
    """
    Retrieve all organization records from the database and return their serialized data dictionaries.

    Parameters: None

    Returns: list: A list of dictionaries, each representing an organization.
    """
    try:
        organizations = db.session.query(Organization).all()
        return [org.data for org in organizations]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organizations: {e}")

def get_organization(org_id):
    """
    Fetch a single organization by its ID.

    Parameters: org_id (int): The ID of the organization to retrieve.

    Returns: dict or None: Serialized organization data if found; otherwise None.
    """
    try:
        org = db.session.get(Organization, org_id)
        return org.data if org else None
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organization {org_id}: {e}")

def create_organization(data):
    """
    Create a new organization using the provided data fields.

    Parameters: data (dict): A dictionary containing the fields required to instantiate an Organization.

    Returns: int: The ID of the newly created organization.
    """
    try:
        new_org = Organization(**data)
        db.session.add(new_org)
        db.session.commit()
        return new_org.id
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create organization: {e}")

def update_organization(org_id, data):
    """
    Update an existing organization with new field values.

    Parameters: org_id (int): The ID of the organization to update.
    data (dict): A dictionary of fields to update on the organization.

    Returns: dict or None: The updated serialized organization data if the record exists; otherwise None.
    """
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
    """
    Delete an organization from the database.

    Parameters: org_id (int): The ID of the organization to delete.

    Returns: bool: True if deletion was successful; False if the organization does not exist.
    """
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
