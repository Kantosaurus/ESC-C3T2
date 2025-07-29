import cors from "cors";

// Define allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    // In production, only allow specific domains
    const productionOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (productionOrigins.length === 0) {
      throw new Error(
        "ALLOWED_ORIGINS environment variable must be set in production"
      );
    }
    return productionOrigins;
  }

  // In development, allow localhost with various ports
  return [
    "http://localhost:3000",
    "http://localhost:5173", // Vite default port
    "http://localhost:4173", // Vite preview port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    // Allow any localhost port for development flexibility
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
  ];
};

// CORS configuration with security best practices
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("CORS: Allowing request with no origin");
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    for (const allowedOrigin of allowedOrigins) {
      if (typeof allowedOrigin === "string" && allowedOrigin === origin) {
        console.log(`CORS: Allowing origin: ${origin}`);
        return callback(null, true);
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        console.log(`CORS: Allowing origin (regex match): ${origin}`);
        return callback(null, true);
      }
    }

    // Log unauthorized origin attempts
    console.warn(`CORS: Unauthorized origin attempted: ${origin}`);
    console.warn(`CORS: Allowed origins:`, allowedOrigins);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-CSRF-Token",
    "csrf-token",
  ],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400, // Cache preflight requests for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export const corsWithConfig = () => {
  return cors(corsOptions);
};

// Export the CORS options for testing
export const CORS_OPTIONS = corsOptions;
