CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    nonce VARCHAR(255),
    state TEXT,
    access_token TEXT,
    code_verifier VARCHAR(255),
    sub VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient cleanup of expired sessions
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Index for efficient lookup by session ID
CREATE INDEX idx_sessions_id ON sessions(id);