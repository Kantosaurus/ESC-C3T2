import { z } from "zod/v4";
import { elderSchema } from "./elder.schema.js";

export const getInviteLinkResponseDtoSchema = z.object({
  inviteLink: z
    .url()
    .refine((val) => {
      const url = new URL(val);
      return (
        url.searchParams.get("token") !== null &&
        url.searchParams.get("elderName") !== null
      );
    }, "The invite link must contain token and elderName query parameters")
    .describe("The invite link for the elder"),
  elderId: elderSchema.shape.id,
});

export type GetInviteLinkResponseDto = z.infer<
  typeof getInviteLinkResponseDtoSchema
>;
