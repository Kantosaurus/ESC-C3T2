import { SessionEntity } from "./session.entity";

export const SESSION_COOKIE_NAME = "carely-session";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
};

export type SessionData = Record<
  string,
  | {
      nonce?: string;
      // Store state as search params to easily stringify key-value pairs
      state?: URLSearchParams;
      accessToken?: string;
      codeVerifier?: string;
      sub?: string;
    }
  | undefined
>;

/**
 * Database-backed session storage with automatic expiration and cleanup.
 * This replaces the previous in-memory session storage.
 */
export class SessionManager {
  private static isInitialized = false;

  /**
   * Initialize session management (start cleanup timer)
   */
  static async initialize(): Promise<void> {
    if (!this.isInitialized) {
      // Ensure the sessions table has the correct schema
      await SessionEntity.ensureTableSchema();

      SessionEntity.startCleanup();
      this.isInitialized = true;
      console.log("Session management initialized with automatic cleanup");
    }
  }

  /**
   * Create a new session
   */
  static async createSession(
    sessionId: string,
    data: {
      nonce?: string;
      state?: URLSearchParams;
      accessToken?: string;
      codeVerifier?: string;
      sub?: string;
    }
  ): Promise<void> {
    await SessionEntity.create({
      id: sessionId,
      nonce: data.nonce,
      state: data.state?.toString(),
      accessToken: data.accessToken,
      codeVerifier: data.codeVerifier,
      sub: data.sub,
    });
  }

  /**
   * Get session data by ID
   */
  static async getSession(sessionId: string): Promise<{
    nonce?: string;
    state?: URLSearchParams;
    accessToken?: string;
    codeVerifier?: string;
    sub?: string;
  } | null> {
    const session = await SessionEntity.getById(sessionId);
    if (!session) return null;

    return {
      nonce: session.nonce,
      state: session.state ? new URLSearchParams(session.state) : undefined,
      accessToken: session.accessToken,
      codeVerifier: session.codeVerifier,
      sub: session.sub,
    };
  }

  /**
   * Update session data
   */
  static async updateSession(
    sessionId: string,
    data: {
      nonce?: string;
      state?: URLSearchParams;
      accessToken?: string;
      codeVerifier?: string;
      sub?: string;
    }
  ): Promise<void> {
    await SessionEntity.update(sessionId, {
      nonce: data.nonce,
      state: data.state?.toString(),
      accessToken: data.accessToken,
      codeVerifier: data.codeVerifier,
      sub: data.sub,
    });
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await SessionEntity.delete(sessionId);
  }

  /**
   * Clean up expired sessions manually
   */
  static async cleanupExpired(): Promise<number> {
    return await SessionEntity.cleanupExpired();
  }

  /**
   * Stop session management (cleanup timer)
   */
  static shutdown(): void {
    SessionEntity.stopCleanup();
    this.isInitialized = false;
    console.log("Session management shutdown");
  }
}

/**
 * Legacy in-memory session data object for backward compatibility.
 * @deprecated Use SessionManager instead
 */
export const sessionData: SessionData = {};

// Initialize session management on module load
SessionManager.initialize().catch((error) => {
  console.error("Failed to initialize session management:", error);
});
