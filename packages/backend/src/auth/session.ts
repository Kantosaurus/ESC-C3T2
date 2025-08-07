export const SESSION_COOKIE_NAME = "carely-session";
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: "strict" as const, // CSRF protection
  maxAge: 60 * 60 * 1000, // 1 hour
};

// Re-export session management functions for convenience
export {
  createSession,
  getSession,
  deleteSession,
  cleanupExpiredSessions,
  getSessionCount,
  type SessionData,
} from "./session.entity";
