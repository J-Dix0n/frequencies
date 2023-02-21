CREATE TABLE listeners (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT,
    preferences jsonb,
    age INT,
    location TEXT,
    events jsonb,
    friends jsonb,
    bio TEXT
);

ALTER TABLE listeners ALTER COLUMN friends SET DEFAULT '[]';
ALTER TABLE listeners ALTER COLUMN preferences SET DEFAULT '[]';
ALTER TABLE listeners ALTER COLUMN events SET DEFAULT '[]';

CREATE TABLE promoters (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT,
    company_name TEXT,
    company_location TEXT,
    events jsonb,
    followers jsonb
);

ALTER TABLE promoters ALTER COLUMN events SET DEFAULT '[]';
ALTER TABLE promoters ALTER COLUMN followers SET DEFAULT '[]';

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT,
    location TEXT,
    genre TEXT,
    artist_list jsonb,
    attendees jsonb,
    promoter_id int,
    Price int
);

ALTER TABLE events ALTER COLUMN artist_list SET DEFAULT '[]';
ALTER TABLE events ALTER COLUMN attendees SET DEFAULT '[]';