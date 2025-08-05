-- Create sessions table for secure session storage
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    nonce VARCHAR(255),
    state TEXT, -- Store URLSearchParams as text
    access_token TEXT,
    code_verifier VARCHAR(255),
    sub VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create index for session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);