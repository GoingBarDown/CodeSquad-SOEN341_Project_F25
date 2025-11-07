from db.models import User
from db import db

def get_all_users():
    try:
        users = db.session.query(User).all()
        return [user.data for user in users]
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve users: {e}")

def get_user_by_id(user_id):
    try:
        user = db.session.get(User, user_id)
        return user.data if user else None
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve user {user_id}: {e}")

def authenticate_user(username, password):
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
    try:
        new_user = User(**data)
        db.session.add(new_user)
        db.session.commit()
        return new_user.id
    except Exception as e:
        db.session.rollback()
        raise RuntimeError(f"Failed to create user: {e}")

def update_user(user_id, data):
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
