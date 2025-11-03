import pytest
from flask import Flask
from db import db
from db.models import User
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


@pytest.fixture(scope="function")
def app():
    """Creates a new Flask app and database for each test."""
    app = Flask(__name__)
    app.config.from_object(TestConfig)

    db.init_app(app)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Provides a test client for HTTP route testing (if needed)."""
    return app.test_client()


@pytest.fixture(scope="function")
def session(app):
    """Provides direct access to the database session."""
    with app.app_context():
        yield db.session
