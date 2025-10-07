import sqlite3
from flask import jsonify
from db.db_utils import get_db_connection

def get_all_events():
    conn = get_db_connection()
    events = conn.execute("SELECT * FROM events").fetchall()
    conn.close()
    return [dict(u) for u in events]

def get_event_by_id(event_id):
    conn = get_db_connection()
    event = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    conn.close()
    return dict(event) if event else None

def create_event(title):
    conn = get_db_connection()
    cur = conn.execute(
        "INSERT INTO events (title) VALUES (?)",
        (title)
    )
    conn.commit()
    last_id = cur.lastrowid
    conn.close()
    return last_id

def delete_event(event_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()