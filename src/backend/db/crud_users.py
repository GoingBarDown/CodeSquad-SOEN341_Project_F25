from db.models import User
from db import db

def get_all_users():
    users = User.query.all()
    return [user.data for user in users]

def get_user_by_id(user_id):
    user = User.query.get(user_id)
    return user.data if user else None

def create_user(username, password, email):
    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()
    return new_user.id # Maybe change to return the dictionary

def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()