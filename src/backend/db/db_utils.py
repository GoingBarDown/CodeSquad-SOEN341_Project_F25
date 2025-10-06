import sqlite3

DATABASE_PATH = "app.db"

def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db(schema_path: str = "db/schema.sql", db_path: str = DATABASE_PATH):
    """Initialize a new database using schema.sql."""
    conn = sqlite3.connect(db_path)
    with open(schema_path, "r") as f:
        conn.executescript(f.read())
    conn.close()
    print(f"Database initialized at {db_path}")

def reset_db():
    init_db()
