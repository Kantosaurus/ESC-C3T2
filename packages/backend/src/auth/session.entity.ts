import { db } from "../db/db";

export interface SessionData {
  id: string;
  nonce?: string;
  state?: string;
  accessToken?: string;
  codeVerifier?: string;
  sub?: string;
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
}

export interface CreateSessionData {
  id: string;
  nonce?: string;
  state?: string;
  accessToken?: string;
  codeVerifier?: string;
  sub?: string;
}

export class SessionEntity {
  private static readonly SESSION_DURATION_HOURS = 1; // 1 hour session duration
  private static readonly CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  private static cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Log current table structure for debugging
   */
  static async logTableStructure(): Promise<void> {
    try {
      const columns = await db.any(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        ORDER BY ordinal_position
      `);

      console.log("Current sessions table structure:");
      columns.forEach((col) => {
        console.log(
          `  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`
        );
      });
    } catch (error) {
      console.error("Error getting table structure:", error);
    }
  }

  /**
   * Check and fix sessions table schema if needed
   */
  static async ensureTableSchema(): Promise<void> {
    try {
      // Check if the table exists and has the correct columns
      const columns = await db.any(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        ORDER BY ordinal_position
      `);

      const requiredColumns = [
        "id",
        "nonce",
        "state",
        "access_token",
        "code_verifier",
        "sub",
        "created_at",
        "expires_at",
        "last_accessed_at",
      ];

      const existingColumns = columns.map((col) => col.column_name);
      const missingColumns = requiredColumns.filter(
        (col) => !existingColumns.includes(col)
      );

      // Check if we have session_id instead of id
      const hasSessionId = existingColumns.includes("session_id");
      const hasId = existingColumns.includes("id");

      if (hasSessionId && !hasId) {
        console.log("Found session_id column, renaming to id...");
        await db.none("ALTER TABLE sessions RENAME COLUMN session_id TO id");
        console.log("Renamed session_id to id successfully");
      }

      if (missingColumns.length > 0) {
        console.log(
          `Sessions table missing columns: ${missingColumns.join(", ")}`
        );
        console.log("Fixing sessions table schema...");

        // Add missing columns
        for (const column of missingColumns) {
          switch (column) {
            case "nonce":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS nonce VARCHAR(255)"
              );
              break;
            case "state":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS state TEXT"
              );
              break;
            case "access_token":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS access_token TEXT"
              );
              break;
            case "code_verifier":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS code_verifier VARCHAR(255)"
              );
              break;
            case "sub":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS sub VARCHAR(255)"
              );
              break;
            case "created_at":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
              );
              break;
            case "expires_at":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '1 hour'"
              );
              break;
            case "last_accessed_at":
              await db.none(
                "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
              );
              break;
          }
        }

        // Create indexes if they don't exist
        await db.none(
          "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)"
        );
        await db.none(
          "CREATE INDEX IF NOT EXISTS idx_sessions_id ON sessions(id)"
        );

        console.log("Sessions table schema fixed successfully");
      }
    } catch (error) {
      console.error("Error checking/fixing sessions table schema:", error);
      throw error;
    }
  }

  /**
   * Create a new session with expiration
   */
  static async create(data: CreateSessionData): Promise<void> {
    // Ensure table schema is correct before creating session
    await this.ensureTableSchema();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.SESSION_DURATION_HOURS);

    try {
      await db.none(
        `INSERT INTO sessions (id, nonce, state, access_token, code_verifier, sub, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          data.id,
          data.nonce || null,
          data.state || null,
          data.accessToken || null,
          data.codeVerifier || null,
          data.sub || null,
          expiresAt,
        ]
      );
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get a session by ID and update last accessed time
   */
  static async getById(id: string): Promise<SessionData | null> {
    // Ensure table schema is correct before querying
    await this.ensureTableSchema();

    const session = await db.oneOrNone(
      `SELECT id, nonce, state, access_token, code_verifier, sub, 
               created_at, expires_at, last_accessed_at
        FROM sessions 
        WHERE id = $1 AND expires_at > NOW()`,
      [id]
    );

    if (session) {
      // Update last accessed time
      await this.updateLastAccessed(id);

      return {
        id: session.id,
        nonce: session.nonce,
        state: session.state,
        accessToken: session.access_token,
        codeVerifier: session.code_verifier,
        sub: session.sub,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        lastAccessedAt: session.last_accessed_at,
      };
    }

    return null;
  }

  /**
   * Update session data
   */
  static async update(
    id: string,
    data: Partial<CreateSessionData>
  ): Promise<void> {
    // Ensure table schema is correct before updating
    await this.ensureTableSchema();

    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (data.nonce !== undefined) {
      updates.push(`nonce = $${paramIndex++}`);
      values.push(data.nonce);
    }
    if (data.state !== undefined) {
      updates.push(`state = $${paramIndex++}`);
      values.push(data.state);
    }
    if (data.accessToken !== undefined) {
      updates.push(`access_token = $${paramIndex++}`);
      values.push(data.accessToken);
    }
    if (data.codeVerifier !== undefined) {
      updates.push(`code_verifier = $${paramIndex++}`);
      values.push(data.codeVerifier);
    }
    if (data.sub !== undefined) {
      updates.push(`sub = $${paramIndex++}`);
      values.push(data.sub);
    }

    if (updates.length === 0) return;

    values.push(id);
    await db.none(
      `UPDATE sessions SET ${updates.join(
        ", "
      )}, last_accessed_at = NOW() WHERE id = $${paramIndex}`,
      values
    );
  }

  /**
   * Delete a session
   */
  static async delete(id: string): Promise<void> {
    await db.none("DELETE FROM sessions WHERE id = $1", [id]);
  }

  /**
   * Update last accessed time for a session
   */
  private static async updateLastAccessed(id: string): Promise<void> {
    await db.none(
      "UPDATE sessions SET last_accessed_at = NOW() WHERE id = $1",
      [id]
    );
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpired(): Promise<number> {
    const result = await db.result(
      "DELETE FROM sessions WHERE expires_at <= NOW()"
    );
    return result.rowCount || 0;
  }

  /**
   * Start automatic cleanup of expired sessions
   */
  static startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(async () => {
      try {
        const deletedCount = await this.cleanupExpired();
        if (deletedCount > 0) {
          console.log(`Cleaned up ${deletedCount} expired sessions`);
        }
      } catch (error) {
        console.error("Error during session cleanup:", error);
      }
    }, this.CLEANUP_INTERVAL_MS);

    // Also run cleanup on startup
    this.cleanupExpired().catch((error) => {
      console.error("Error during initial session cleanup:", error);
    });
  }

  /**
   * Stop automatic cleanup
   */
  static stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
