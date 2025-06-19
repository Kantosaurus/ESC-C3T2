import { RequestHandler } from "express";
import { authorizationHeaderSchema, jwtPayloadSchema } from "@carely/core";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { jwtSecret } from "./secret";

const JWKS = createRemoteJWKSet(
  new URL(
    process.env.CLERK_JWKS_URL ?? "https://clerk.dev/.well-known/jwks.json"
  )
);

type AuthMiddlewareConfig = {
  verifier: (jwt: string) => Promise<{ payload: unknown }>;
};

export const authMiddleware =
  (
    config: AuthMiddlewareConfig = {
      verifier: (jwt) => {
        // check if the JWT was signed by carely
        const claims = decodeJwt(jwt);
        if (claims.iss === "carely") {
          // if so, verify it with carely's secret
          return jwtVerify(jwt, jwtSecret);
        } else {
          // if not, check if it was signed by clerk
          return jwtVerify(jwt, JWKS);
        }
      },
    }
  ): RequestHandler =>
  (req, res, next) =>
    authorizationHeaderSchema
      .parseAsync(req.headers.authorization) // extract jwt from header
      .then(config.verifier) // verify jwt
      .then(({ payload }) => jwtPayloadSchema.parseAsync(payload)) // parse the payload
      .then(({ sub }) => {
        res.locals.user = { userId: sub };
        next();
      }) // update the user context for use with subsequent middleware
      .catch(() => {
        res.status(401).send();
      }); // throw generic 401 if any of the above steps have failed
