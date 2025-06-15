import { RequestHandler, Request, Response } from "express";
import z from "zod/v4";

const authenticatedLocalsSchema = z.object({
  user: z.object({
    userId: z.string(),
  }),
});

type AuthenticatedLocals = z.infer<typeof authenticatedLocalsSchema>;

// type gymnastics
export type Authenticated<T extends RequestHandler> = T extends RequestHandler<
  infer P,
  infer ResBody,
  infer ReqBody,
  infer ReqQuery,
  Record<string, unknown>
>
  ? RequestHandler<P, ResBody, ReqBody, ReqQuery, AuthenticatedLocals>
  : never;

type AuthenticatedRequest<T extends RequestHandler = RequestHandler> =
  T extends Request<
    infer P,
    infer ResBody,
    infer ReqBody,
    infer ReqQuery,
    Record<string, unknown>
  >
    ? Request<P, ResBody, ReqBody, ReqQuery, AuthenticatedLocals>
    : never;

type AuthenticatedResponse<T extends RequestHandler = RequestHandler> =
  T extends Request<
    unknown,
    infer ResBody,
    unknown,
    unknown,
    Record<string, unknown>
  >
    ? Response<ResBody, AuthenticatedLocals>
    : never;

/**
 * Authentication Guard to check if request has been authenticated by the middleware.
 * This middleware checks if `res.locals` has been populated my the middleware.
 *
 * Usage:
 * ```
 * const someHandler = authenticated((res, req, next) => {
 * 		req.locals.user.userId; // this is properly typed
 * })
 * ```
 */
export const authenticated = <T extends RequestHandler>(
  handler: Authenticated<T>
): RequestHandler => {
  return ((req, res, next) =>
    authenticatedLocalsSchema
      .parseAsync(res.locals)
      .catch(next) // TODO: add a warning log. this should only occur if there is a logical error
      .then(() =>
        handler(req as AuthenticatedRequest, res as AuthenticatedResponse, next)
      )) as RequestHandler;
};
