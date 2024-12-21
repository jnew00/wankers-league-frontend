CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone_number TEXT,
    image_path TEXT,
    current_quota INTEGER DEFAULT 0, -- The player's current quota
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
