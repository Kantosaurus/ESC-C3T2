import { RequestHandler } from "express";
import { authorizationHeaderSchema, jwtPayloadSchema } from "@esc-c3t2/core";
import { createRemoteJWKSet, jwtVerify } from "jose";

if (!process.env.CLERK_JWKS_URL) {
  throw new Error("Please set CLERK_JWKS_URL environment variable");
}

const JWKS = createRemoteJWKSet(new URL(process.env.CLERK_JWKS_URL));

export const authMiddleware: RequestHandler = (req, res, next) => {
  authorizationHeaderSchema
    .parseAsync(req.headers.authorization) // extract jwt from header
    .then((jwt) => jwtVerify(jwt, JWKS)) // verify jwt with JWKS
    .then(({ payload }) => jwtPayloadSchema.parseAsync(payload)) // parse the payload
    .then(({ sub }) => {
      res.locals.user = { userId: sub };
      next();
    }) // update the user context for use with subsequent middleware
    .catch(() => {
      res.status(401).send();
    }); // throw generic 401 if any of the above steps have failed
};
