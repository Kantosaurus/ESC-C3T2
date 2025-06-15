import z from "zod/v4";

/**
 * JWT Authorization Header Schema.
 *
 * This also removes the "Bearer " prefix from the token
 */
export const authorizationHeaderSchema = z
  .string({ error: "Authorization header is required" })
  .refine(
    (x) => x.startsWith("Bearer "),
    'Authorization header must start with "Bearer"'
  )
  .transform((x) => x.split(" ")[1]);
