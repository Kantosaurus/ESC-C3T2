/**
 * Secret key for signing JWTs.
 */
const secretValue = process.env.CARELY_JWT_SECRET;

if (!secretValue || secretValue === "your_jwt_secret_here") {
  throw new Error(
    "CARELY_JWT_SECRET environment variable must be set to a secure random value. " +
      "Generate one using: openssl rand -base64 32"
  );
}

export const jwtSecret = new TextEncoder().encode(secretValue);
