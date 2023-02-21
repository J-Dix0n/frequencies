CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT,
    preferences TEXT,
    age INT,
    location TEXT,
    events TEXT,
    role TEXT
);