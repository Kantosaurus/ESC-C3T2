import { RequestHandler } from "express";
import { authorizationHeaderSchema, jwtPayloadSchema } from "@carely/core";
import { jwtVerify } from "jose";
import { jwtSecret } from "./secret";

type AuthMiddlewareConfig = {
  verifier: (jwt: string) => Promise<{ payload: unknown }>;
};

export const authMiddleware =
  (
    config: AuthMiddlewareConfig = {
      verifier: (jwt) => jwtVerify(jwt, jwtSecret),
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
