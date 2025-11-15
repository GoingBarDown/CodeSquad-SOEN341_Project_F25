import pytest
from db.crud import crud_users
from db.models import User
from db import db

@pytest.fixture
def sample_user_data():
    """
    Fixture providing a valid sample user payload.

    Returns:
        dict: A dictionary containing fields required to create a User.
    """
    return {
        "username": "testuser",
        "password": "securepassword",
        "email": "test@example.com",
        "role": "user"
    }


def test_create_user(session, sample_user_data):
    """
    Test creating a new user record.

    Steps:
        1. Create a user using valid sample data.
        2. Retrieve the created user from the database.
        3. Assert key fields match expected values.

    Ensures:
        - User creation works.
        - Data is persisted correctly.
    """
    user_id = crud_users.create_user(sample_user_data)
    assert user_id is not None

    user = db.session.get(User, user_id)
    assert user.username == "testuser"
    assert user.email == "test@example.com"


def test_get_user_by_id(session, sample_user_data):
    """
    Test retrieving a user by ID.

    Steps:
        1. Create a sample user.
        2. Retrieve it via `get_user_by_id`.
        3. Assert returned fields match the created data.

    Ensures:
        - User lookup by ID functions correctly.
    """
    user_id = crud_users.create_user(sample_user_data)
    result = crud_users.get_user_by_id(user_id)

    assert result["username"] == "testuser"
    assert result["email"] == "test@example.com"


def test_get_user_by_id_not_found(session):
    """
    Test retrieving a non-existent user returns None.

    Ensures:
        - Missing user IDs are handled gracefully.
    """
    result = crud_users.get_user_by_id(9999)
    assert result is None


def test_get_all_users(session, sample_user_data):
    """
    Test retrieving all users from the database.

    Steps:
        1. Create two user records.
        2. Retrieve all users.
        3. Validate count and data integrity.

    Ensures:
        - Bulk user retrieval works.
        - Newly created users appear in the returned list.
    """
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
    """
    Test updating an existing user.

    Steps:
        1. Create a user.
        2. Update the username.
        3. Assert the update persisted.

    Ensures:
        - User update operations modify records as expected.
    """
    user_id = crud_users.create_user(sample_user_data)
    crud_users.update_user(user_id, {"username": "updated"})

    updated = db.session.get(User, user_id)
    assert updated.username == "updated"


def test_update_nonexistent_user(session):
    """
    Test updating a user that does not exist.

    Ensures:
        - CRUD returns None rather than raising an exception.
    """
    result = crud_users.update_user(9999, {"username": "nothing"})
    assert result is None


def test_delete_user(session, sample_user_data):
    """
    Test deleting an existing user.

    Steps:
        1. Create a user.
        2. Delete the user.
        3. Assert deletion succeeded and the record is gone.

    Ensures:
        - User deletion works and removes the entry from persistence.
    """
    user_id = crud_users.create_user(sample_user_data)
    assert crud_users.delete_user(user_id) is True
    assert db.session.get(User, user_id) is None


def test_delete_nonexistent_user(session):
    """
    Test deleting a user that does not exist.

    Ensures:
        - CRUD returns False for missing deletion targets.
    """
    assert crud_users.delete_user(9999) is False
