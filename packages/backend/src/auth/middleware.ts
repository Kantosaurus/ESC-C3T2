import { RequestHandler } from "express";
import { authorizationHeaderSchema, jwtPayloadSchema } from "@esc-c3t2/core";
import { createRemoteJWKSet, jwtVerify } from "jose";

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
    config: AuthMiddlewareConfig = { verifier: (jwt) => jwtVerify(jwt, JWKS) }
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
