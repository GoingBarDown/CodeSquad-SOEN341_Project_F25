from db import db
from db.models import OrganizerProfile, User
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

def get_profile(user_id):
    """Get organizer profile by user ID"""
    return OrganizerProfile.query.filter_by(user_id=user_id).first()

def create_profile(user_id, profile_data):
    """Create a new organizer profile"""
    try:
        profile = OrganizerProfile(
            user_id=user_id,
            display_name=profile_data.get('display_name'),
            profile_picture=profile_data.get('profile_picture'),
            phone=profile_data.get('phone'),
            bio=profile_data.get('bio')
        )
        db.session.add(profile)
        db.session.commit()
        return profile
    except SQLAlchemyError as e:
        db.session.rollback()
        raise e

def update_profile(user_id, profile_data):
    """Update an existing organizer profile"""
    try:
        profile = get_profile(user_id)
        if not profile:
            return None

        # Update fields if they exist in profile_data
        if 'display_name' in profile_data:
            profile.display_name = profile_data['display_name']
        if 'profile_picture' in profile_data:
            profile.profile_picture = profile_data['profile_picture']
        if 'phone' in profile_data:
            profile.phone = profile_data['phone']
        if 'bio' in profile_data:
            profile.bio = profile_data['bio']

        profile.updated_at = datetime.utcnow()
        db.session.commit()
        return profile
    except SQLAlchemyError as e:
        db.session.rollback()
        raise e

def delete_profile(user_id):
    """Delete an organizer profile"""
    try:
        profile = get_profile(user_id)
        if profile:
            db.session.delete(profile)
            db.session.commit()
            return True
        return False
    except SQLAlchemyError as e:
        db.session.rollback()
        raise e