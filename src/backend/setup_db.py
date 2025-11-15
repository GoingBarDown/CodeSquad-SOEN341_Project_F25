from flask import Flask
from config import Config
from db import db
from db.models import Organization
import json

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    """Database reset script.

    This script is intended to completely reset the application's database.
    It initializes a minimal Flask application context, connects to the
    configured database, drops all existing tables, and recreates them from
    the defined SQLAlchemy models.

    Behavior:
        - drop_all(): Removes all tables and data from the database.
        - create_all(): Recreates all tables based on current model definitions.
        - Prints a confirmation message upon success.

    Usage:
        Run this file manually when a fresh database state is needed,
        such as during development, testing, or after modifying models.

    Warning:
        This operation is destructive and irreversible. All existing data
        will be permanently deleted. Do not use in production environments.
    """
    db.drop_all()
    db.create_all()
    print("Database reset successfully.")
    
    # Load and seed organizations from JSON
    try:
        with open('organizations_seed.json', 'r') as f:
            organizations_data = json.load(f)
            for org_data in organizations_data:
                org = Organization(title=org_data['title'], description=org_data.get('description', ''), status="approved")
                db.session.add(org)
            db.session.commit()
            print(f"✅ Seeded {len(organizations_data)} organizations (all pre-approved).")
    except FileNotFoundError:
        print("⚠️ organizations_seed.json not found. Skipping organization seeding.")
    except Exception as e:
        print(f"❌ Error seeding organizations: {e}")
        db.session.rollback()
