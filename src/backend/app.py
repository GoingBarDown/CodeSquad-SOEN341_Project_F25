from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes import users_routes, events_routes, ticket_routes, organization_routes, organization_members_routes
from db import db

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

users_routes.register_routes(app)
events_routes.register_routes(app)
ticket_routes.register_routes(app)
organization_routes.register_routes(app)
organization_members_routes.register_routes(app)

@app.route('/')
def index():
    """Root endpoint for verifying API availability.

    Returns: tuple:
            - JSON message confirming the API is reachable.
            - HTTP status 200.
    """
    return jsonify({"message": "Hello, this is root"})

if __name__ == '__main__':
    """Application entry point.

    Behavior:
        - Initializes the database and creates all tables if they do not exist.
        - Runs the Flask development server with debug mode enabled.

    Note:
        Running with debug=True enables auto-reload and improved error messages,
        but should not be used in production.
    """
    with app.app_context():
        db.create_all()
    app.run(debug=True)
