import pytest
from db.crud import crud_users
from db.models import User
from db import db

@pytest.fixture
def sample_user_data():
    return {
        "username": "testuser",
        "password": "securepassword",
        "email": "test@example.com",
        "role": "user"
    }

def test_create_user(session, sample_user_data):
    user_id = crud_users.create_user(sample_user_data)
    assert user_id is not None

    user = db.session.get(User, user_id)
    assert user.username == "testuser"
    assert user.email == "test@example.com"

def test_get_user_by_id(session, sample_user_data):
    user_id = crud_users.create_user(sample_user_data)
    result = crud_users.get_user_by_id(user_id)

    assert result["username"] == "testuser"
    assert result["email"] == "test@example.com"

def test_get_all_users(session, sample_user_data):
    crud_users.create_user(sample_user_data)
    crud_users.create_user({
        "username": "seconduser",
        "password": "abc123",
        "email": "second@example.com",
        "role": "admin"
    })

    users = crud_users.get_all_users()
    assert len(users) == 2
    assert any(u["username"] == "seconduser" for u in users)

def test_update_user(session, sample_user_data):
    user_id = crud_users.create_user(sample_user_data)
    crud_users.update_user(user_id, {"username": "updated"})

    updated = db.session.get(User, user_id)
    assert updated.username == "updated"

def test_delete_user(session, sample_user_data):
    user_id = crud_users.create_user(sample_user_data)
    assert crud_users.delete_user(user_id) is True
    assert db.session.get(User, user_id) is None

def test_delete_nonexistent_user(session):
    assert crud_users.delete_user(9999) is False
