import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod/v4";
import jwt from "jsonwebtoken";

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },

  // Stricter rate limit for authentication endpoints
  AUTH_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Request size limits
  REQUEST_LIMITS: {
    json: "1mb", // Limit JSON payloads to 1MB
    urlencoded: "1mb", // Limit URL-encoded payloads to 1MB
    text: "1mb", // Limit text payloads to 1MB
  },

  // CSRF configuration
  CSRF: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    },
  },
};

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// Rate limiting middleware
export const rateLimiter: RequestHandler = rateLimit(
  SECURITY_CONFIG.RATE_LIMIT
);

// Stricter rate limiting for authentication endpoints
export const authRateLimiter: RequestHandler = rateLimit(
  SECURITY_CONFIG.AUTH_RATE_LIMIT
);

// Request size limiting middleware
export const requestSizeLimiter: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const contentLength = parseInt(req.headers["content-length"] || "0");
  const maxSize = 1024 * 1024; // 1MB in bytes

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: "Request entity too large",
      message: "Request body exceeds the maximum allowed size of 1MB",
    });
  }

  next();
};

// CSRF token validation middleware
export const csrfProtection: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF protection for GET requests and authentication endpoints
  if (
    req.method === "GET" ||
    (req.path && req.path.startsWith("/api/singpass")) ||
    req.path === "/api/redirect" ||
    (req.path && req.path.startsWith("/api/caregiver")) || // Skip CSRF for caregiver endpoints in development
    (req.path && req.path.startsWith("/api/elder")) || // Skip CSRF for elder endpoints in development
    (req.path && req.path.startsWith("/api/appointment")) || // Skip CSRF for appointment endpoints in development
    (req.path && req.path.startsWith("/api/notes")) || // Skip CSRF for notes endpoints in development
    (req.path && req.path.startsWith("/api/maps")) // Skip CSRF for maps endpoints in development
  ) {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"] || req.headers["csrf-token"];
  const sessionToken = req.headers["authorization"]?.replace("Bearer ", "");

  // Check if CSRF token or session token is missing (undefined or null)
  if (
    csrfToken === undefined ||
    csrfToken === null ||
    sessionToken === undefined ||
    sessionToken === null ||
    sessionToken === ""
  ) {
    return res.status(403).json({
      error: "CSRF token missing",
      message: "CSRF token is required for this request",
    });
  }

  // Check if CSRF token is empty string or invalid
  if (
    csrfToken === "" ||
    typeof csrfToken !== "string" ||
    csrfToken.length < 32
  ) {
    return res.status(403).json({
      error: "Invalid CSRF token",
      message: "CSRF token is invalid",
    });
  }

  // Validate CSRF token against session token
  try {
    const decoded = jwt.verify(
      csrfToken,
      process.env.JWT_SECRET || "fallback-secret"
    );
    if (typeof decoded === "object" && decoded && "sessionId" in decoded) {
      const sessionId = (decoded as { sessionId: string }).sessionId;
      if (sessionId === sessionToken) {
        return next();
      }
    }
  } catch {
    // Token verification failed
  }

  return res.status(403).json({
    error: "Invalid CSRF token",
    message: "CSRF token is invalid",
  });
};

// Input validation middleware using Zod schemas
export const validateInput = <T>(schema: z.ZodSchema<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        let errorDetails = [];

        if (error.errors && Array.isArray(error.errors)) {
          errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
        } else if (error.message) {
          try {
            const parsedErrors = JSON.parse(error.message);
            if (Array.isArray(parsedErrors)) {
              errorDetails = parsedErrors.map((err) => ({
                field: err.path?.join(".") || "unknown",
                message: err.message || "Validation failed",
              }));
            }
          } catch {
            errorDetails = [
              {
                field: "unknown",
                message: error.message || "Validation failed",
              },
            ];
          }
        }

        return res.status(400).json({
          error: "Validation failed",
          details:
            errorDetails.length > 0
              ? errorDetails
              : [{ field: "unknown", message: "Validation failed" }],
        });
      } else {
        return res.status(400).json({
          error: "Validation failed",
          details: [{ field: "unknown", message: "Validation failed" }],
        });
      }
    }
  };
};

// Parameter validation middleware
export const validateParams = <T>(schema: z.ZodSchema<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as Record<string, unknown>;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        let errorDetails = [];

        if (error.errors && Array.isArray(error.errors)) {
          errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
        } else if (error.message) {
          try {
            const parsedErrors = JSON.parse(error.message);
            if (Array.isArray(parsedErrors)) {
              errorDetails = parsedErrors.map((err) => ({
                field: err.path?.join(".") || "unknown",
                message: err.message || "Invalid parameters",
              }));
            }
          } catch {
            errorDetails = [
              {
                field: "unknown",
                message: error.message || "Invalid parameters",
              },
            ];
          }
        }

        return res.status(400).json({
          error: "Invalid parameters",
          details:
            errorDetails.length > 0
              ? errorDetails
              : [{ field: "unknown", message: "Invalid parameters" }],
        });
      } else {
        return res.status(400).json({
          error: "Invalid parameters",
          details: [{ field: "unknown", message: "Invalid parameters" }],
        });
      }
    }
  };
};

// Query parameter validation middleware
export const validateQuery = <T>(schema: z.ZodSchema<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as Record<string, unknown>;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        let errorDetails = [];

        if (error.errors && Array.isArray(error.errors)) {
          errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
        } else if (error.message) {
          try {
            const parsedErrors = JSON.parse(error.message);
            if (Array.isArray(parsedErrors)) {
              errorDetails = parsedErrors.map((err) => ({
                field: err.path?.join(".") || "unknown",
                message: err.message || "Invalid query parameters",
              }));
            }
          } catch {
            errorDetails = [
              {
                field: "unknown",
                message: error.message || "Invalid query parameters",
              },
            ];
          }
        }

        return res.status(400).json({
          error: "Invalid query parameters",
          details:
            errorDetails.length > 0
              ? errorDetails
              : [{ field: "unknown", message: "Invalid query parameters" }],
        });
      } else {
        return res.status(400).json({
          error: "Invalid query parameters",
          details: [{ field: "unknown", message: "Invalid query parameters" }],
        });
      }
    }
  };
};

// Security headers middleware (additional custom headers)
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // Remove server information
  res.removeHeader("X-Powered-By");

  next();
};

// Request logging middleware for security monitoring
export const securityLogging = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request details for security monitoring
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers["user-agent"],
    contentLength: req.headers["content-length"],
    contentType: req.headers["content-type"],
  };

  // Log suspicious requests
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
  ];

  const requestBody = JSON.stringify(req.body);
  const isSuspicious = suspiciousPatterns.some(
    (pattern) => pattern.test(requestBody) || pattern.test(req.url)
  );

  if (isSuspicious) {
    console.warn("Suspicious request detected:", logData);
  }

  // Log response time and status
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const responseData = {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      console.warn("Request failed:", responseData);
    }
  });

  next();
};

// Export the security configuration
export const SECURITY_MIDDLEWARE_CONFIG = SECURITY_CONFIG;
