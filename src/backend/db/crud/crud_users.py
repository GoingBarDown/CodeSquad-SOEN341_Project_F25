from db.models import User
from db import db

def get_all_users():
    """
    Retrieve all user records from the database and return their serialized data dictionaries.

    Parameters: None

    Returns: list: A list of dictionaries, each representing a user.
    """
    try:
        users = db.session.query(User).all()
        return [user.data for user in users]
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve users: {e}")

def get_user_by_id(user_id):
    """
    Retrieve a single user by their unique ID.

    Parameters: user_id (int): The ID of the user to retrieve.

    Returns: dict or None: Serialized user data if the user exists; otherwise None.
    """
    try:
        user = db.session.get(User, user_id)
        return user.data if user else None
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve user {user_id}: {e}")

def authenticate_user(username, password):
    """
    Authenticate a user using their username and password.

    Parameters: username (str): The username of the user attempting to authenticate.
    password (str): The password supplied for authentication.

    Returns: dict or None: Serialized user data if authentication succeeds; otherwise None.
    """
    try:
        user = db.session.query(User).filter_by(username=username).first()
        if not user:
            return None
        if user.password != password:
            return None
        return user.data
    except Exception as e:
        raise RuntimeError(f"Failed to authenticate user: {e}")

def create_user(data):
    """
    Create a new user with the provided field data.

    Parameters: data (dict): A dictionary containing the fields required to create a User.

    Returns: int: The ID of the newly created user.
    """
    try:
        new_user = User(**data)
        db.session.add(new_user)
        db.session.commit()
        return new_user.id
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create user: {e}")

def update_user(user_id, data):
    """
    Update an existing user with new field values.

    Parameters: user_id (int): The ID of the user to update.
    data (dict): A dictionary of fields to update.

    Returns: dict or None: The updated serialized user data if the user exists; otherwise None.
    """
    try:
        user = db.session.get(User, user_id)
        if not user:
            return None

        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        db.session.commit()
        return user.data
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to update user {user_id}: {e}")

def delete_user(user_id):
    """
    Delete a user from the database.

    Parameters: user_id (int): The ID of the user to delete.

    Returns: bool: True if deletion succeeds; False if the user does not exist.
    """
    try:
        user = db.session.get(User, user_id)
        if not user:
            return False

        db.session.delete(user)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to delete user {user_id}: {e}")
