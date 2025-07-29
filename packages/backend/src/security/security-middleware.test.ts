import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import {
  rateLimiter,
  authRateLimiter,
  requestSizeLimiter,
  csrfProtection,
  securityHeaders,
  securityLogging,
  validateInput,
  validateParams,
  validateQuery,
} from "./security-middleware";
import { z } from "zod/v4";

describe("Security Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      method: "GET",
      url: "/test",
      path: "/test",
      headers: {},
      body: {},
      params: {},
      query: {},
      ip: "127.0.0.1",
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      removeHeader: vi.fn(),
      on: vi.fn(),
    };
    next = vi.fn();
  });

  describe("requestSizeLimiter", () => {
    it("should allow requests within size limit", () => {
      req.headers = { "content-length": "1024" };
      requestSizeLimiter(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject requests exceeding size limit", () => {
      req.headers = { "content-length": "2097152" }; // 2MB
      requestSizeLimiter(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        error: "Request entity too large",
        message: "Request body exceeds the maximum allowed size of 1MB",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle requests without content-length", () => {
      requestSizeLimiter(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("csrfProtection", () => {
    it("should allow GET requests", () => {
      req.method = "GET";
      csrfProtection(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should allow authentication endpoints", () => {
      req.method = "POST";
      req.path = "/api/singpass/auth-url";
      csrfProtection(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject requests without CSRF token", () => {
      req.method = "POST";
      req.path = "/api/test";
      csrfProtection(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "CSRF token missing",
        message: "CSRF token is required for this request",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject requests with empty CSRF token", () => {
      req.method = "POST";
      req.path = "/api/test";
      req.headers = {
        "x-csrf-token": "" as string,
        authorization: "Bearer test-token",
      };
      csrfProtection(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "CSRF token missing",
        message: "CSRF token is required for this request",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow requests with valid CSRF token", () => {
      // Create a valid JWT token for testing
      const jwt = require("jsonwebtoken");
      const testSecret = "test-secret";
      const sessionToken = "test-session-123";
      const csrfToken = jwt.sign({ sessionId: sessionToken }, testSecret);

      req.method = "POST";
      req.path = "/api/test";
      req.headers = {
        "x-csrf-token": csrfToken,
        authorization: `Bearer ${sessionToken}`,
      };

      // Mock the JWT verification to use our test secret
      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = testSecret;

      csrfProtection(req as Request, res as Response, next);

      // Restore original environment
      process.env.JWT_SECRET = originalEnv;

      expect(next).toHaveBeenCalled();
    });
  });

  describe("securityHeaders", () => {
    it("should set security headers", () => {
      securityHeaders(req as Request, res as Response, next);
      expect(res.setHeader).toHaveBeenCalledWith(
        "X-Content-Type-Options",
        "nosniff"
      );
      expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
      expect(res.setHeader).toHaveBeenCalledWith(
        "X-XSS-Protection",
        "1; mode=block"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()"
      );
      expect(res.removeHeader).toHaveBeenCalledWith("X-Powered-By");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("securityLogging", () => {
    it("should log suspicious requests", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      req.body = { test: "<script>alert('xss')</script>" };
      securityLogging(req as Request, res as Response, next);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Suspicious request detected:",
        expect.any(Object)
      );
      consoleSpy.mockRestore();
      expect(next).toHaveBeenCalled();
    });

    it("should not log normal requests", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      req.body = { test: "normal data" };
      securityLogging(req as Request, res as Response, next);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("validateInput", () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    });

    it("should validate correct input", () => {
      req.body = { name: "John", age: 25 };
      const middleware = validateInput(testSchema);
      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: "John", age: 25 });
    });

    it("should reject invalid input", () => {
      req.body = { name: "", age: -1 };
      const middleware = validateInput(testSchema);
      middleware(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [
          {
            field: "name",
            message: "Too small: expected string to have >=1 characters",
          },
          {
            field: "age",
            message: "Too small: expected number to be >=0",
          },
        ],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validateParams", () => {
    const testSchema = z.object({
      id: z.string().min(1),
    });

    it("should validate correct parameters", () => {
      req.params = { id: "123" };
      const middleware = validateParams(testSchema);
      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(req.params).toEqual({ id: "123" });
    });

    it("should reject invalid parameters", () => {
      req.params = { id: "" };
      const middleware = validateParams(testSchema);
      middleware(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid parameters",
        details: [
          {
            field: "id",
            message: "Too small: expected string to have >=1 characters",
          },
        ],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("validateQuery", () => {
    const testSchema = z.object({
      page: z.coerce.number().min(1),
    });

    it("should validate correct query parameters", () => {
      req.query = { page: "1" };
      const middleware = validateQuery(testSchema);
      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ page: 1 });
    });

    it("should reject invalid query parameters", () => {
      req.query = { page: "0" };
      const middleware = validateQuery(testSchema);
      middleware(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid query parameters",
        details: [
          {
            field: "page",
            message: "Too small: expected number to be >=1",
          },
        ],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("rateLimiter", () => {
    it("should be defined", () => {
      expect(rateLimiter).toBeDefined();
    });
  });

  describe("authRateLimiter", () => {
    it("should be defined", () => {
      expect(authRateLimiter).toBeDefined();
    });
  });
});
