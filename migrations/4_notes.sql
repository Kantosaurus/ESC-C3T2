CREATE TABLE notes (
    id TEXT PRIMARY KEY
    elder_name TEXT NOT NULL,
    header TEXT NOT NULL,
    content TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (elder_id) REFERENCES elders(id)
);