from db.models import OrganizationMember
from db import db

def get_all_organization_members():
    """
    Retrieve all organization member records from the database and return their serialized data dictionaries.

    Parameters: None

    Returns: list: A list of dictionaries, each representing an organization member.
    """
    try:
        members = db.session.query(OrganizationMember).all()
        return [member.data for member in members]
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organization members: {e}")

def get_organization_member(organization_id, user_id):
    """
    Fetch a specific organization member using the given organization ID and user ID.

    Parameters: organization_id (int): The ID of the organization.
    user_id (int): The ID of the user associated with the membership.

    Returns: dict or None: The serialized data of the organization member if found; otherwise None.
    """
    try:
        member = db.session.query(OrganizationMember).filter_by(
            organization_id=organization_id, user_id=user_id
        ).first()
        if not member:
            return None
        return member.data
    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch organization member: {e}")

def create_organization_member(data):
    """
    Create a new organization member record using the provided data.

    Parameters: data (dict): A dictionary containing the required fields to create an OrganizationMember.

    Returns: dict: A dictionary containing the newly created member's organization_id and user_id.
    """
    try:
        new_member = OrganizationMember(**data)
        db.session.add(new_member)
        db.session.commit()
        return {"organization_id": new_member.organization_id, "user_id": new_member.user_id}
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create organization member: {e}")

def delete_organization_member(organization_id, user_id):
    """
    Delete an organization member based on the provided organization and user IDs.

    Parameters: organization_id (int): The ID of the organization.
    user_id (int): The ID of the user to remove from the organization.

    Returns: bool: True if the member was successfully deleted; False if the member does not exist.
    """
    try:
        member = db.session.query(OrganizationMember).filter_by(
            organization_id=organization_id, user_id=user_id
        ).first()
        if not member:
            return False
        db.session.delete(member)
        db.session.commit()
        return True
    except ValueError:
        raise
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to delete organization member: {e}")

def update_organization_member(organization_id, user_id, data):
    """
    Update an existing organization member with the provided fields.

    Parameters: organization_id (int): The ID of the organization.
    user_id (int): The ID of the user associated with the membership.
    data (dict): A dictionary of fields to update on the member.

    Returns: dict or None: The updated serialized member data if the member exists; otherwise None.
    """
    try:
        member = db.session.query(OrganizationMember).filter_by(
            organization_id=organization_id, user_id=user_id
        ).first()
        if not member:
            return None
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
