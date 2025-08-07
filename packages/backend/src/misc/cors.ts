import cors from "cors";

export const corsWithConfig = () => {
  // Get allowed origins from environment variable or use safe defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

  // Additional security: validate each origin is properly formatted
  const validOrigins = allowedOrigins.filter((origin) => {
    try {
      new URL(origin);
      return true;
    } catch {
      console.error(`Invalid origin in ALLOWED_ORIGINS: ${origin}`);
      return false;
    }
  });

  return cors({
    origin: validOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  });
};
