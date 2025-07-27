import { RequestHandler } from "express";
import { authorizationHeaderSchema, jwtPayloadSchema } from "@carely/core";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { getJwtSecret, getJwtRotationSecret, checkSecretRotation } from "./secret";

const JWKS = createRemoteJWKSet(
  new URL(
    process.env.CLERK_JWKS_URL ?? "https://clerk.dev/.well-known/jwks.json"
  )
);

type AuthMiddlewareConfig = {
  verifier: (jwt: string) => Promise<{ payload: unknown }>;
};

// Check secret rotation on startup
const rotationCheck = checkSecretRotation();
if (rotationCheck.needsRotation) {
  console.warn(`⚠️  JWT Secret rotation recommended: ${rotationCheck.reason}`);
}

export const authMiddleware =
  (
    config: AuthMiddlewareConfig = {
      verifier: async (jwt) => {
        try {
          // check if the JWT was signed by carely
          const claims = decodeJwt(jwt);
          if (claims.iss === "carely") {
            // Try with current secret first
            try {
              return await jwtVerify(jwt, getJwtSecret());
            } catch (error) {
              // If current secret fails, try with rotation secret
              try {
                return await jwtVerify(jwt, getJwtRotationSecret());
              } catch (rotationError) {
                // If both fail, throw the original error
                throw error;
              }
            }
          } else {
            // if not, check if it was signed by clerk
            return await jwtVerify(jwt, JWKS);
          }
        } catch (error) {
          console.error("JWT verification failed:", error);
          throw error;
        }
      },
    }
  ): RequestHandler =>
  (req, res, next) => {
    // Check for secret rotation on each request (optional, can be moved to startup)
    if (process.env.NODE_ENV === 'production') {
      const rotationCheck = checkSecretRotation();
      if (rotationCheck.needsRotation) {
        console.warn(`⚠️  JWT Secret rotation needed: ${rotationCheck.reason}`);
      }
    }

    authorizationHeaderSchema
      .parseAsync(req.headers.authorization) // extract jwt from header
      .then(config.verifier) // verify jwt
      .then(({ payload }) => jwtPayloadSchema.parseAsync(payload)) // parse the payload
      .then(({ sub }) => {
        res.locals.user = { userId: sub };
        next();
      }) // update the user context for use with subsequent middleware
      .catch((error) => {
        console.error("Authentication failed:", error);
        res.status(401).json({ 
          error: "Authentication failed",
          message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }); // throw generic 401 if any of the above steps have failed
  };
