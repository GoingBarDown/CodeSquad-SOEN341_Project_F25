from flask import Flask, flash, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = "app.db"

def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection

@app.route('/')
def index():
    return jsonify({"message": "Hello, this is root"})

@app.route('/users')
def get_users():
    connection = get_db_connection()
    rows = connection.execute("SELECT * FROM users").fetchall()
    connection.close()
    return jsonify([dict(row) for row in rows])

@app.route('/events')
def get_events():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM events").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/tickets')
def get_tickets():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM tickets").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/organizations')
def get_organizations():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM organizations").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/organization_members')
def get_org_members():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM organization_members").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

if __name__ == '__main__':
    app.run(debug=True)