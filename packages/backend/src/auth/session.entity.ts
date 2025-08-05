import { db } from "../db/db";
import z from "zod/v4";

export const sessionSchema = z.object({
  session_id: z.string(),
  nonce: z.string().nullish(),
  state: z.string().nullish(), // URLSearchParams stored as string
  access_token: z.string().nullish(),
  code_verifier: z.string().nullish(),
  sub: z.string().nullish(),
  created_at: z.date(),
  expires_at: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;

export type SessionData = {
  nonce?: string;
  state?: URLSearchParams;
  accessToken?: string;
  codeVerifier?: string;
  sub?: string;
};

/**
 * Create a new session in the database
 */
export const createSession = async (
  sessionId: string,
  sessionData: SessionData,
  expiresInMinutes: number = 60
): Promise<void> => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await db.query(
    `
    INSERT INTO sessions (session_id, nonce, state, access_token, code_verifier, sub, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      sessionId,
      sessionData.nonce || null,
      sessionData.state?.toString() || null,
      sessionData.accessToken || null,
      sessionData.codeVerifier || null,
      sessionData.sub || null,
      expiresAt,
    ]
  );
};

/**
 * Retrieve a session by ID
 */
export const getSession = async (
  sessionId: string
): Promise<SessionData | null> => {
  const result = await db.query(
    `
    SELECT * FROM sessions 
    WHERE session_id = $1 AND expires_at > NOW()
    `,
    [sessionId]
  );

  if (result.length === 0) {
    return null;
  }

  const session = sessionSchema.parse(result[0]);

  return {
    nonce: session.nonce || undefined,
    state: session.state ? new URLSearchParams(session.state) : undefined,
    accessToken: session.access_token || undefined,
    codeVerifier: session.code_verifier || undefined,
    sub: session.sub || undefined,
  };
};

/**
 * Update a session with new data
 */
export const updateSession = async (
  sessionId: string,
  sessionData: Partial<SessionData>
): Promise<void> => {
  const updates: string[] = [];
  const values: (string | null)[] = [];
  let paramCount = 1;

  if (sessionData.nonce !== undefined) {
    updates.push(`nonce = $${paramCount++}`);
    values.push(sessionData.nonce || null);
  }

  if (sessionData.state !== undefined) {
    updates.push(`state = $${paramCount++}`);
    values.push(sessionData.state?.toString() || null);
  }

  if (sessionData.accessToken !== undefined) {
    updates.push(`access_token = $${paramCount++}`);
    values.push(sessionData.accessToken || null);
  }

  if (sessionData.codeVerifier !== undefined) {
    updates.push(`code_verifier = $${paramCount++}`);
    values.push(sessionData.codeVerifier || null);
  }

  if (sessionData.sub !== undefined) {
    updates.push(`sub = $${paramCount++}`);
    values.push(sessionData.sub || null);
  }

  if (updates.length === 0) {
    return; // Nothing to update
  }

  values.push(sessionId);

  await db.query(
    `
    UPDATE sessions 
    SET ${updates.join(", ")}
    WHERE session_id = $${paramCount} AND expires_at > NOW()
    `,
    values
  );
};

/**
 * Delete a session by ID
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  await db.query(
    `
    DELETE FROM sessions WHERE session_id = $1
    `,
    [sessionId]
  );
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  const result = await db.query(
    `
    DELETE FROM sessions WHERE expires_at <= NOW()
    `
  );

  return result.rowCount || 0;
};

/**
 * Get session count for monitoring
 */
export const getSessionCount = async (): Promise<number> => {
  const result = await db.query(
    `
    SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()
    `
  );

  return parseInt(result[0].count, 10);
};
