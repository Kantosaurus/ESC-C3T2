import z from "zod/v4";
import { addressSchema } from "../address/address.schema.js";

export const elderSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required"),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  phone: z
    .string()
    .max(15, "Phone number must be at most 15 characters long")
    .regex(
      /^[689]\d{7}$/,
      "Phone number must be a valid Singapore number starting with 6, 8, or 9"
    )
    .nullish(),
  bio: z.string().nullish(),
  profile_picture: z.string().nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  ...addressSchema.shape,
});

export type Elder = z.infer<typeof elderSchema>;

export const newElderDtoSchema = elderSchema.pick({
  name: true,
  date_of_birth: true,
  gender: true,
  phone: true,
  bio: true,
  profile_picture: true,
  street_address: true,
  unit_number: true,
  postal_code: true,
  longitude: true,
  latitude: true,
});

export type NewElderDto = z.input<typeof newElderDtoSchema>;
