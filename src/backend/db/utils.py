from datetime import datetime

def parse_iso_datetime(value):
    """Converts a default JavaScript date time object to a Python readable format.

    Parameters: value (ISO formatted datetime string).

    Returns: None if value is not provided or conversion fails, converted datetime otherwise.
    """
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        return None
