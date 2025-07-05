import z from "zod/v4";
import { addressSchema } from "../address/address.schema.js";

export const caregiverSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  phone: z
    .string()
    .regex(
      /^[986]\d{7}$/,
      "Phone number must be exactly 8 digits and start with 9, 8, or 6"
    )
    .max(15, "Phone number must be at most 15 characters long")
    .nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  ...addressSchema.shape,
});

export type Caregiver = z.infer<typeof caregiverSchema>;
