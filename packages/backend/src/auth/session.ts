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
 * This should be a real database in production.
 * For simplicity, we are using an in-memory object to store session data.
 * This is not suitable for production use as it will not persist across server restarts.
 */
export const sessionData: SessionData = {};
