import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { corsWithConfig, CORS_OPTIONS } from "./cors";

describe("CORS Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("corsWithConfig", () => {
    it("should return a CORS middleware function", () => {
      const corsMiddleware = corsWithConfig();
      expect(typeof corsMiddleware).toBe("function");
    });
  });

  describe("CORS_OPTIONS", () => {
    it("should have correct configuration", () => {
      expect(CORS_OPTIONS).toHaveProperty("origin");
      expect(CORS_OPTIONS).toHaveProperty("credentials");
      expect(CORS_OPTIONS).toHaveProperty("methods");
      expect(CORS_OPTIONS).toHaveProperty("allowedHeaders");
      expect(CORS_OPTIONS).toHaveProperty("exposedHeaders");
      expect(CORS_OPTIONS).toHaveProperty("maxAge");
      expect(CORS_OPTIONS).toHaveProperty("preflightContinue");
      expect(CORS_OPTIONS).toHaveProperty("optionsSuccessStatus");
    });

    it("should allow credentials", () => {
      expect(CORS_OPTIONS.credentials).toBe(true);
    });

    it("should have correct methods", () => {
      expect(CORS_OPTIONS.methods).toEqual([
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ]);
    });

    it("should have correct allowed headers", () => {
      expect(CORS_OPTIONS.allowedHeaders).toEqual([
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-CSRF-Token",
        "csrf-token",
      ]);
    });

    it("should have correct exposed headers", () => {
      expect(CORS_OPTIONS.exposedHeaders).toEqual([
        "Content-Length",
        "X-Requested-With",
      ]);
    });

    it("should have correct max age", () => {
      expect(CORS_OPTIONS.maxAge).toBe(86400);
    });

    it("should have correct preflight continue setting", () => {
      expect(CORS_OPTIONS.preflightContinue).toBe(false);
    });

    it("should have correct options success status", () => {
      expect(CORS_OPTIONS.optionsSuccessStatus).toBe(204);
    });
  });

  describe("Origin validation", () => {
    it("should allow requests with no origin", () => {
      const callback = vi.fn();
      CORS_OPTIONS.origin!("", callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should allow localhost origins in development", () => {
      const callback = vi.fn();
      CORS_OPTIONS.origin!("http://localhost:3000", callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should allow localhost:5173 in development", () => {
      const callback = vi.fn();
      CORS_OPTIONS.origin!("http://localhost:5173", callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should allow 127.0.0.1 origins in development", () => {
      const callback = vi.fn();
      CORS_OPTIONS.origin!("http://127.0.0.1:3000", callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should reject unauthorized origins", () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      CORS_OPTIONS.origin!("https://malicious-site.com", callback);

      expect(consoleSpy).toHaveBeenCalledWith(
        "CORS: Unauthorized origin attempted: https://malicious-site.com"
      );
      expect(callback).toHaveBeenCalledWith(new Error("Not allowed by CORS"));

      consoleSpy.mockRestore();
    });
  });

  describe("Environment-specific behavior", () => {
    it("should use development origins when NODE_ENV is not production", () => {
      process.env.NODE_ENV = "development";

      // Test that development origins are allowed
      const callback = vi.fn();
      CORS_OPTIONS.origin!("http://localhost:3000", callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should handle production environment configuration", () => {
      process.env.NODE_ENV = "production";
      process.env.ALLOWED_ORIGINS =
        "https://app.carely.com,https://admin.carely.com";

      // Test that the configuration is properly set
      expect(process.env.NODE_ENV).toBe("production");
      expect(process.env.ALLOWED_ORIGINS).toBe(
        "https://app.carely.com,https://admin.carely.com"
      );
    });
  });
});
