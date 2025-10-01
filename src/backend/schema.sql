DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS organization_members;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    category TEXT,
    capacity INTEGER,
    price REAL,
    link TEXT,
    organizer_id INTEGER,
    seating TEXT,
    status TEXT,
    rating REAL,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE TABLE tickets (
    id INTEGER PRIMARY KEY,
    attendee_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    qr_code TEXT,
    FOREIGN KEY (attendee_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE organizations (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT
);

CREATE TABLE organization_members (
    organization_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (organization_id, user_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
