from flask import Flask, jsonify
from config import Config
from routes import users_routes, events_routes, ticket_routes, organization_routes, organization_members_routes
from db import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

users_routes.register_routes(app)
events_routes.register_routes(app)
ticket_routes.register_routes(app)
organization_routes.register_routes(app)
organization_members_routes.register_routes(app)

@app.route('/')
def index():
    return jsonify({"message": "Hello, this is root"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)