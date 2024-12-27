CREATE TABLE wanker.courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    front_tee TEXT,
    back_tee TEXT,
    website TEXT,
    scorecard JSONB, -- To store scorecard details: hole number, par, handicap, distance for each hole
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
