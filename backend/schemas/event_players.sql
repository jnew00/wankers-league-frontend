CREATE TABLE event_players (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    quota INTEGER NOT NULL, -- The player's quota at the time of the event
    score INTEGER NOT NULL, -- The score the player achieved in the event
    ctps INTEGER DEFAULT 0,
    skins INTEGER DEFAULT 0,
    money_won NUMERIC DEFAULT 0.0,
    rank INTEGER DEFAULT NULL,
    total_points NUMERIC DEFAULT 0.0, -- Calculated in code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
