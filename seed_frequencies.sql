TRUNCATE TABLE listeners, promoters, events, messages RESTART IDENTITY;

CREATE TABLE listeners (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT,
    preferences jsonb,
    age INT,
    location TEXT,
    picture TEXT DEFAULT 'default.jpeg',
    events jsonb,  /* status [1 = interested, 2 = attending, 3 = attended]*/ 
    friends jsonb, /* status [1 = pending, 2 = accepted]*/
    following jsonb,
    bio TEXT
);

ALTER TABLE listeners ALTER COLUMN friends SET DEFAULT '[]';
ALTER TABLE listeners ALTER COLUMN preferences SET DEFAULT '[]';
ALTER TABLE listeners ALTER COLUMN events SET DEFAULT '[]';
ALTER TABLE listeners ALTER COLUMN following SET DEFAULT '[]';

CREATE TABLE promoters (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT,
    company_name TEXT,
    picture TEXT DEFAULT 'default.jpeg',
    company_location TEXT,
    events jsonb, /* status: [1 = upcoming, 2 = ended]*/
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
    price int,
    date date
);

ALTER TABLE events ALTER COLUMN artist_list SET DEFAULT '[]';
ALTER TABLE events ALTER COLUMN attendees SET DEFAULT '[]';

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    SentUser_id int,
    ReceiveUser_id int,
    Message text,
    Date timestamp
);

INSERT INTO listeners ("first_name", "last_name", "email", "password", "preferences", "age", "location", "events", "friends", "following", "bio") VALUES
('John', 'Marrs', 'jMarrs@gmail.com', 'jmpassword', '[{ "genre" : "Indie"}]', 30, 'London', '[{"event_id" : "1", "status": "1"}]', '[{"listener_id" : "2", "status": "2"}]','[{"promoter_id" : "1"}]','Hi, I''m John'),
('Stephen', 'King', 'sKing@gmail.com', 'skpassword', '[{ "genre" : "Rock"}]', 56, 'Glasgow', '[{"event_id" : "2", "status": "2"}]', '[{"listener_id" : "1", "status": "2"}]', '[{"promoter_id" : "2"}]','Hi, I''m Stephen'),
('Dean', 'Koontz', 'dKoontz@gmail.com', 'dkpassword', '[{ "genre" : "Electronic"}]', 19, 'London', '[{"event_id" : "1", "status": "2"}]', '[{"listener_id" : "7", "status": "1"}]','[{"promoter_id" : "1"}]', 'Hi, I''m Dean'),
('Ania', 'Ahlborn', 'aAhlborn@gmail.com', 'aapassword', '[{ "genre" : "Alternative"}]', 21, 'Blackpool', '[{"event_id" : "3", "status": "1"}]', '[{"listener_id" : "5", "status": "2"}]', '[{"promoter_id" : "3"}]', 'Hi, I''m Ania'),
('Adam', 'Nevill', 'aNevill@gmail.com', 'anpassword', '[{ "genre" : "Rock"}]', 28, 'London', '[{"event_id" : "1", "status": "1"}]', '[{"listener_id" : "4", "status": "2"}]','[{"promoter_id" : "1"}]', 'Hi, I''m Adam'),
('John', 'Lindqvist', 'jLindqvist@gmail.com', 'jlpassword', '[{ "genre" : "Indie"}]', 33, 'Manchester', '[{"event_id" : "4", "status": "2"}]', '[{"listener_id" : "7", "status": "2"}]', '[{"promoter_id" : "4"}]', 'Hi I''m John'),
('Paul', 'Tremblay', 'pTremblay@gmail.com', 'ptpassword', '[{ "genre" : "Metal"}]', 25, 'Glasgow', '[{"event_id" : "2", "status": "2"}]', '[{"listener_id" : "6", "status": "2"}]', '[{"promoter_id" : "2"}]', 'Hi I''m Paul');

INSERT INTO promoters ("first_name", "last_name", "email", "password", "company_name", "company_location", "events", "followers") VALUES
('Boris', 'Bacic', 'bb@bbevents.com', 'bbpassword', 'BB Events', 'London', '[{"event_id" : "1", "status": "1"},{"event_id" : "5", "status": "1"}]', '[{"listener_id" : "1"}, {"listener_id" : "3"}, {"listener_id" : "5"}]'),
('Terry', 'Pratchett', 'tp@tpevents.com', 'tppassword', 'TP Events', 'Glasgow', '[{"event_id" : "2", "status": "1"}]','[{"listener_id" : "2"},{"listener_id" : "7"}]'),
('Scott', 'Carson', 'sc@scevents.com', 'scpassword', 'SC Events', 'Blackpool', '[{"event_id" : "3", "status": "1"}]', '[{"listener_id" : "4"}]'),
('Margaret', 'Atwood', 'ma@maevents.com', 'mapassword', 'MA Events', 'Manchester', '[{"event_id" : "4", "status": "1"}]','[{"listener_id" : "6"}]');

INSERT INTO events ("name", "location", "genre", "artist_list", "attendees", "promoter_id", "price", "date") VALUES
('Illuminaughty Presents: Utopia', 'London', 'Electronic','[{"artist" : "Astrix", "genre" : "Electronic"}]', '[{"listener_id" : "3"}]', 1, 25.99, '12/04/2023'),
('Country To Country 2023', 'Glasgow', 'Country', '[{"artist" : "Zac Brown Band", "genre" : "Country"}]', '[{"listener_id" : "2"},{"listener_id" : "7"}]', 2, 99.60,'11/03/2023'),
('Revival Music Festival Weekender 2023', 'Blackpool', 'Indie', '[{"artist" : "Tofu Fighters", "genre" : "Indie"}]', '[]', 3, 13.59, '04/03/2023'),
('Fatboy Slim', 'Manchester','Electronic','[{"artist" : "Fatboy Slim", "genre" : "Electronic"}]', '[{"listener_id" : "6"}]', 4, 45.10, '11/03/2023'),
('Paramore', 'London', 'Alternative', '[{"artist" : "Paramore", "genre" : "Alternative"}]', '[]', 1, 50.00, '04/23/2023');

INSERT INTO messages (sentuser_id, receiveuser_id, message) VALUES (1, 2, 'hi'), (2, 1, 'how are you?'), (1, 2, 'not bad thanks'), (3, 1, 'hi!'), (2, 3, 'I hate that guy');