def validate_profile_data(data):
    """Validate organizer profile data"""
    errors = []

    # Check display name
    display_name = data.get('display_name')
    if display_name and (len(display_name) < 2 or len(display_name) > 80):
        errors.append('Display name must be between 2 and 80 characters')

    # Check phone number format (basic validation)
    phone = data.get('phone')
    if phone and not (phone.replace('-', '').replace('+', '').replace(' ', '').isdigit()):
        errors.append('Invalid phone number format')

    # Check bio length
    bio = data.get('bio')
    if bio and len(bio) > 500:
        errors.append('Bio must not exceed 500 characters')

    # Check profile picture URL
    profile_picture = data.get('profile_picture')
    if profile_picture and not (
        profile_picture.startswith('http://') or 
        profile_picture.startswith('https://') or
        profile_picture.startswith('/uploads/')
    ):
        errors.append('Invalid profile picture URL')

    return {
        'valid': len(errors) == 0,
        'errors': errors
    }