import z from "zod/v4";

// New address schema for more robust address handling
export const addressSchema = z.object({
  street_address: z
    .string()
    .min(1, "Street address is required")
    .max(255, "Street address must be at most 255 characters"),
  unit_number: z
    .string()
    .max(20, "Unit number must be at most 20 characters")
    .optional(),
  postal_code: z
    .string()
    .min(6, "Postal code must be at least 6 characters")
    .max(10, "Postal code must be at most 10 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be at most 100 characters"),
  state: z
    .string()
    .min(1, "State/Province is required")
    .max(100, "State/Province must be at most 100 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be at most 100 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

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
  // Keep the old address field for backward compatibility
  address: z
    .string()
    .max(255, "Address must be at most 255 characters long")
    .nullish(),
  // New structured address fields
  address_details: addressSchema.nullish(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Caregiver = z.infer<typeof caregiverSchema>;
export type Address = z.infer<typeof addressSchema>;
