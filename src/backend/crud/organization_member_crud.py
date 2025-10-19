from app import get_db_connection

def create_organization_member(organization_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO organization_members (organization_id, user_id) VALUES (?, ?)",
        (organization_id, user_id)
    )
    conn.commit()
    conn.close()

def get_organization_member(organization_id, user_id):
    conn = get_db_connection()
    member = conn.execute(
        "SELECT * FROM organization_members WHERE organization_id = ? AND user_id = ?",
        (organization_id, user_id)
    ).fetchone()
    conn.close()
    return dict(member) if member else None

def delete_organization_member(organization_id, user_id):
    conn = get_db_connection()
    conn.execute(
        "DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?",
        (organization_id, user_id)
    )
    conn.commit()
    conn.close()