import z from "zod/v4";

export const jwtPayloadSchema = z.object({
  sub: z.string(),
});
