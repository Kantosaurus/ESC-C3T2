import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { SessionManager } from "./session";
import { SessionEntity } from "./session.entity";
import { db } from "../db/db";

describe("Session Management", () => {
  beforeAll(async () => {
    // Check if sessions table exists, if not create it
    try {
      await db.none("SELECT 1 FROM sessions LIMIT 1");
    } catch {
      // Table doesn't exist, create it
      await db.none(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(255) PRIMARY KEY,
          nonce VARCHAR(255),
          state TEXT,
          access_token TEXT,
          code_verifier VARCHAR(255),
          sub VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create indexes
      await db.none(`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
      `);
      await db.none(`
        CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id)
      `);
    }
  });

  beforeEach(async () => {
    // Clean up any existing sessions before each test
    await SessionEntity.cleanupExpired();
  });

  afterEach(async () => {
    // Clean up after each test
    await SessionEntity.cleanupExpired();
  });

  afterAll(async () => {
    // Stop cleanup timer
    SessionManager.shutdown();
  });

  describe("SessionManager", () => {
    it("should create and retrieve a session", async () => {
      const sessionId = `test-session-1-${Date.now()}`;
      const sessionData = {
        nonce: "test-nonce",
        state: new URLSearchParams("param1=value1&param2=value2"),
        codeVerifier: "test-code-verifier",
      };

      // Create session
      await SessionManager.createSession(sessionId, sessionData);

      // Retrieve session
      const retrieved = await SessionManager.getSession(sessionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.nonce).toBe(sessionData.nonce);
      expect(retrieved?.state?.toString()).toBe(sessionData.state.toString());
      expect(retrieved?.codeVerifier).toBe(sessionData.codeVerifier);
    });

    it("should update session data", async () => {
      const sessionId = `test-session-2-${Date.now()}`;
      const initialData = {
        nonce: "initial-nonce",
        codeVerifier: "initial-verifier",
      };

      // Create session
      await SessionManager.createSession(sessionId, initialData);

      // Update session
      const updateData = {
        accessToken: "new-access-token",
        sub: "user-123",
      };
      await SessionManager.updateSession(sessionId, updateData);

      // Retrieve updated session
      const retrieved = await SessionManager.getSession(sessionId);

      expect(retrieved?.nonce).toBe(initialData.nonce);
      expect(retrieved?.codeVerifier).toBe(initialData.codeVerifier);
      expect(retrieved?.accessToken).toBe(updateData.accessToken);
      expect(retrieved?.sub).toBe(updateData.sub);
    });

    it("should delete a session", async () => {
      const sessionId = `test-session-3-${Date.now()}`;
      const sessionData = {
        nonce: "test-nonce",
        codeVerifier: "test-verifier",
      };

      // Create session
      await SessionManager.createSession(sessionId, sessionData);

      // Verify session exists
      const beforeDelete = await SessionManager.getSession(sessionId);
      expect(beforeDelete).toBeDefined();

      // Delete session
      await SessionManager.deleteSession(sessionId);

      // Verify session is deleted
      const afterDelete = await SessionManager.getSession(sessionId);
      expect(afterDelete).toBeNull();
    });

    it("should return null for non-existent session", async () => {
      const nonExistentId = `non-existent-session-${Date.now()}`;
      const retrieved = await SessionManager.getSession(nonExistentId);
      expect(retrieved).toBeNull();
    });
  });

  describe("SessionEntity", () => {
    it("should clean up expired sessions", async () => {
      // Create a session that expires in the past
      const expiredSessionId = `expired-session-${Date.now()}`;
      await db.none(
        `INSERT INTO sessions (id, nonce, expires_at) 
         VALUES ($1, $2, NOW() - INTERVAL '1 hour')`,
        [expiredSessionId, "expired-nonce"]
      );

      // Create a valid session
      const validSessionId = `valid-session-${Date.now()}`;
      await SessionEntity.create({
        id: validSessionId,
        nonce: "valid-nonce",
      });

      // Run cleanup
      const deletedCount = await SessionEntity.cleanupExpired();

      // Verify expired session was deleted
      expect(deletedCount).toBeGreaterThan(0);

      // Verify valid session still exists
      const validSession = await SessionEntity.getById(validSessionId);
      expect(validSession).toBeDefined();

      // Verify expired session was deleted
      const expiredSession = await SessionEntity.getById(expiredSessionId);
      expect(expiredSession).toBeNull();
    });
  });
});
