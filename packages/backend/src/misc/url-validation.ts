/**
 * Validate and sanitize frontend host URLs to prevent open redirect attacks
 */
export const validateFrontendHost = (host: string): string => {
  try {
    const url = new URL(host);

    // Only allow HTTP/HTTPS protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }

    // In production, restrict to specific domains
    if (process.env.NODE_ENV === "production") {
      const allowedHosts = process.env.ALLOWED_FRONTEND_HOSTS?.split(",") || [];
      if (!allowedHosts.includes(url.host)) {
        throw new Error("Host not allowed in production");
      }
    } else {
      // In development, only allow localhost
      if (!url.hostname.includes("localhost") && url.hostname !== "127.0.0.1") {
        throw new Error("Only localhost allowed in development");
      }
    }

    return url.origin; // Return only origin (protocol + host + port)
  } catch (error) {
    console.error("Invalid FRONTEND_HOST configured:", host, error);
    // Fallback to safe default
    return "http://localhost:3000";
  }
};

export const getValidatedFrontendHost = (): string => {
  return validateFrontendHost(
    process.env.FRONTEND_HOST || "http://localhost:3000"
  );
};
