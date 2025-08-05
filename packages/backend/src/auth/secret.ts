/**
 * Secret key for signing JWTs.
 */
const isTestEnvironment =
  process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const secretValue = process.env.CARELY_JWT_SECRET;

// In test environment, use a default test secret if none provided
const getJwtSecret = (): string => {
  if (isTestEnvironment) {
    return secretValue || "test-jwt-secret-32-chars-long-for-testing-purposes";
  }

  // For development and production, require a proper secret
  if (!secretValue || secretValue === "your_jwt_secret_here") {
    throw new Error(
      "CARELY_JWT_SECRET environment variable must be set to a secure random value. " +
        "Generate one using: openssl rand -base64 32"
    );
  }

  return secretValue;
};

export const jwtSecret = new TextEncoder().encode(getJwtSecret());
