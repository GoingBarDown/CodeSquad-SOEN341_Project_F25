from app import get_db_connection

def create_organization(title, description, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO organizations (title, description, status) VALUES (?, ?, ?)", 
        (title, description, status)
    )
    conn.commit()
    org_id = cursor.lastrowid
    conn.close()
    return org_id

def get_organization(org_id):
    conn = get_db_connection()
    org = conn.execute("SELECT * FROM organizations WHERE id = ?", (org_id,)).fetchone()
    conn.close()
    return dict(org) if org else None

def update_organization(org_id, title, description, status):
    conn = get_db_connection()
    conn.execute(
        "UPDATE organizations SET title = ?, description = ?, status = ? WHERE id = ?",
        (title, description, status, org_id)
    )
    conn.commit()
    conn.close()
    
def delete_organization(org_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM organizations WHERE id = ?", (org_id,))
    conn.commit()
    conn.close()