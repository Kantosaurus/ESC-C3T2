CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    header VARCHAR(80) NOT NULL,
    content TEXT,
    caregiver_id TEXT,
    assigned_elder_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caregiver_id) REFERENCES caregivers(id), 
    FOREIGN KEY (assigned_elder_id) REFERENCES elders(id)
);