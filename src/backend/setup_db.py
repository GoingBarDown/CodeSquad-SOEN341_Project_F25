from flask import Flask
from config import Config
from db import db
from db.models import Organization
import json

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database reset successfully.")
    
    # Load and seed organizations from JSON
    try:
        with open('organizations_seed.json', 'r') as f:
            organizations_data = json.load(f)
            for org_data in organizations_data:
                org = Organization(title=org_data['title'], description="", status="approved")
                db.session.add(org)
            db.session.commit()
            print(f"✅ Seeded {len(organizations_data)} organizations (all pre-approved).")
    except FileNotFoundError:
        print("⚠️ organizations_seed.json not found. Skipping organization seeding.")
    except Exception as e:
        print(f"❌ Error seeding organizations: {e}")
        db.session.rollback()
