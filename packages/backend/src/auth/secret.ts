/**
 * Secret key for signing JWTs.
 */
export const jwtSecret = new TextEncoder().encode(
  process.env.CARELY_JWT_SECRET || "your_jwt_secret_here"
);
