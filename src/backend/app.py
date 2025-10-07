from flask import Flask, flash, jsonify
import sqlite3
from routes import users_routes
from routes import events_routes
from db.db_utils import init_db, get_db_connection

app = Flask(__name__)

DATABASE = "app.db"

users_routes.register_routes(app)
events_routes.register_routes(app)

@app.route('/')
def index():
    return jsonify({"message": "Hello, this is root"})

if __name__ == '__main__':
    app.run(debug=True)