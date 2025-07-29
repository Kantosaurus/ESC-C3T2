import { z } from "zod/v4";

export const addressSchema = z.object({
  street_address: z
    .string()
    .min(1, "Street address is required")
    .max(255, "Street address must be at most 255 characters")
    .nullish(),
  unit_number: z
    .string()
    .max(20, "Unit number must be at most 20 characters")
    .optional()
    .nullish(),
  postal_code: z
    .string()
    .min(6, "Postal code must be at least 6 characters")
    .max(10, "Postal code must be at most 10 characters")
    .nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

export type Address = z.infer<typeof addressSchema>;
