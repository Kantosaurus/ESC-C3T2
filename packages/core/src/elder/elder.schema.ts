import z from "zod/v4";
import { addressSchema } from "../caregiver/caregiver.schema.js";

export const elderSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .max(15, "Phone number must be at most 15 characters long")
    .nullish(),
  address: z.string().max(255, "Address must be at most 255 characters long"),
  address_details: addressSchema.nullish(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Elder = z.infer<typeof elderSchema>;

export const newElderDtoSchema = elderSchema.pick({
  name: true,
  phone: true,
  address: true,
  address_details: true,
});

export type NewElderDto = Pick<
  Elder,
  "name" | "phone" | "address" | "address_details"
>;
