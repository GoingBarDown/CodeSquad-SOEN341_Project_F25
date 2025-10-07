# import sqlite3
# from flask import jsonify
# from db.db_utils import get_db_connection

# def get_all_users():
#     conn = get_db_connection()
#     users = conn.execute("SELECT * FROM users").fetchall()
#     conn.close()
#     return [dict(u) for u in users]

# def get_user_by_id(user_id):
#     conn = get_db_connection()
#     user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
#     conn.close()
#     return dict(user) if user else None

# def create_user(username, password, email):
#     conn = get_db_connection()
#     cur = conn.execute(
#         "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
#         (username, password, email)
#     )
#     conn.commit()
#     last_id = cur.lastrowid
#     conn.close()
#     return last_id

# def delete_user(user_id):
#     conn = get_db_connection()
#     conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
#     conn.commit()
#     conn.close()

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