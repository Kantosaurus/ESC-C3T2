import { RequestHandler } from "express";
import { authorizationHeaderSchema, jwtPayloadSchema } from "@carely/core";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import {
  getJwtSecret,
  getJwtRotationSecret,
  checkSecretRotation,
} from "./secret";

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
              } catch {
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
  async (req, res, next) => {
    // Check for secret rotation on each request (optional, can be moved to startup)
    if (process.env.NODE_ENV === "production") {
      const rotationCheck = checkSecretRotation();
      if (rotationCheck.needsRotation) {
        console.warn(`⚠️  JWT Secret rotation needed: ${rotationCheck.reason}`);
      }
    }

    try {
      const jwt = await authorizationHeaderSchema.parseAsync(
        req.headers.authorization
      ); // extract jwt from header

      const { payload } = await config.verifier(jwt); // verify jwt
      const { sub } = await jwtPayloadSchema.parseAsync(payload); // parse the payload

      res.locals.user = { userId: sub };
      console.log(`Authentication successful for user: ${sub}`);

      next();
    } catch (error) {
      console.error("Authentication failed:", error);
      res.status(401).send();
    }
  };
