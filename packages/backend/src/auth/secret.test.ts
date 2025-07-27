import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getJwtSecret,
  getJwtRotationSecret,
  checkSecretRotation,
} from "./secret";
import {
  generateSecureSecret,
  validateSecretWithDetails,
} from "./secret-utils";

describe("JWT Secret Management", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe("getJwtSecret", () => {
    it("should throw error in production when no secret is set", () => {
      process.env.NODE_ENV = "production";
      delete process.env.CARELY_JWT_SECRET;

      expect(() => getJwtSecret()).toThrow(
        "CARELY_JWT_SECRET environment variable is required in production"
      );
    });

    it("should generate secure secret in development when no secret is set", () => {
      process.env.NODE_ENV = "development";
      delete process.env.CARELY_JWT_SECRET;

      const secret = getJwtSecret();
      expect(secret).toBeInstanceOf(Uint8Array);
      expect(secret.length).toBeGreaterThan(0);
    });

    it("should reject default secret", () => {
      process.env.CARELY_JWT_SECRET = "your_jwt_secret_here";

      expect(() => getJwtSecret()).toThrow(
        "Default JWT secret cannot be used in production"
      );
    });

    it("should reject weak secrets", () => {
      process.env.CARELY_JWT_SECRET = "weak";

      expect(() => getJwtSecret()).toThrow(
        "JWT secret must be at least 32 characters long"
      );
    });

    it("should accept valid secrets", () => {
      const validSecret = "MySuperSecureSecret123!@#$%^&*()_+-=[]{}|;:,./<>?";
      process.env.CARELY_JWT_SECRET = validSecret;

      const secret = getJwtSecret();
      expect(secret).toBeInstanceOf(Uint8Array);
      expect(secret.length).toBeGreaterThan(0);
    });
  });

  describe("getJwtRotationSecret", () => {
    it("should fall back to main secret when rotation secret is not set", () => {
      const mainSecret = "MySuperSecureSecret123!@#$%^&*()_+-=[]{}|;:,./<>?";
      process.env.CARELY_JWT_SECRET = mainSecret;
      delete process.env.CARELY_JWT_ROTATION_SECRET;

      const rotationSecret = getJwtRotationSecret();
      expect(rotationSecret).toBeInstanceOf(Uint8Array);
    });

    it("should use rotation secret when set", () => {
      const mainSecret = "MySuperSecureSecret123!@#$%^&*()_+-=[]{}|;:,./<>?";
      const rotationSecret = "MyRotationSecret456!@#$%^&*()_+-=[]{}|;:,./<>?";
      process.env.CARELY_JWT_SECRET = mainSecret;
      process.env.CARELY_JWT_ROTATION_SECRET = rotationSecret;

      const result = getJwtRotationSecret();
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe("checkSecretRotation", () => {
    it("should recommend rotation when secret age is not tracked", () => {
      delete process.env.CARELY_JWT_SECRET_AGE;

      const result = checkSecretRotation();
      expect(result.needsRotation).toBe(true);
      expect(result.reason).toBe("Secret age not tracked");
    });

    it("should recommend rotation when secret is too old", () => {
      process.env.CARELY_JWT_SECRET_AGE = "100";
      process.env.CARELY_JWT_MAX_AGE_DAYS = "90";

      const result = checkSecretRotation();
      expect(result.needsRotation).toBe(true);
      expect(result.reason).toBe("Secret is 100 days old (max: 90)");
    });

    it("should not recommend rotation for new secrets", () => {
      process.env.CARELY_JWT_SECRET_AGE = "30";
      process.env.CARELY_JWT_MAX_AGE_DAYS = "90";

      const result = checkSecretRotation();
      expect(result.needsRotation).toBe(false);
    });
  });

  describe("generateSecureSecret", () => {
    it("should generate secrets with proper length", () => {
      const secret = generateSecureSecret();
      expect(secret.length).toBeGreaterThanOrEqual(32);
      expect(secret.length).toBeLessThanOrEqual(64);
    });

    it("should generate unique secrets", () => {
      const secret1 = generateSecureSecret();
      const secret2 = generateSecureSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe("validateSecretWithDetails", () => {
    it("should reject empty secrets", () => {
      const result = validateSecretWithDetails("");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Secret is required");
    });

    it("should reject default secret", () => {
      const result = validateSecretWithDetails("your_jwt_secret_here");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Default JWT secret cannot be used");
    });

    it("should reject short secrets", () => {
      const result = validateSecretWithDetails("short");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Secret must be at least 32 characters long"
      );
    });

    it("should reject secrets with insufficient character types", () => {
      const result = validateSecretWithDetails(
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Secret must contain at least 3 character types (lowercase, uppercase, numbers, special characters)"
      );
    });

    it("should accept valid secrets", () => {
      const validSecret = "MySuperSecureSecret123!@#$%^&*()_+-=[]{}|;:,./<>?";
      const result = validateSecretWithDetails(validSecret);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should provide strength assessment", () => {
      const weakSecret = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const strongSecret = "MySuperSecureSecret123!@#$%^&*()_+-=[]{}|;:,./<>?";

      const weakResult = validateSecretWithDetails(weakSecret);
      const strongResult = validateSecretWithDetails(strongSecret);

      expect(weakResult.strength).toBe("weak");
      expect(strongResult.strength).toBe("strong");
    });
  });
});
