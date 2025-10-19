from app import get_db_connection

def create_ticket(attendee_id, event_id, qr_code):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tickets (attendee_id, event_id, qr_code) VALUES (?, ?, ?)",
        (attendee_id, event_id, qr_code)
    )
    conn.commit()
    ticket_id = cursor.lastrowid
    conn.close()
    return ticket_id

def get_ticket(ticket_id):
    conn = get_db_connection()
    ticket = conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    conn.close()
    return dict(ticket) if ticket else None

def update_ticket(ticket_id, attendee_id, event_id, qr_code):
    conn = get_db_connection()
    conn.execute("UPDATE tickets SET attendee_id = ?, event_id = ?, qr_code = ? WHERE id = ?",
                (attendee_id, event_id, qr_code, ticket_id))
    conn.commit()
    conn.close()
    
def delete_ticket(ticket_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM tickets WHERE id = ?", (ticket_id,))
    conn.commit()
    conn.close()

    