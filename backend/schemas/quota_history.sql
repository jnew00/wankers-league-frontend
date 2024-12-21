CREATE TABLE quota_history (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    previous_quota INTEGER NOT NULL, -- Before the change
    new_quota INTEGER NOT NULL, -- After the change
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, -- Optional link to an event
    reason TEXT, -- Reason for the change
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
