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
  bio: z.string().nullish().default("I'm a happy caregiver :)"),
  profile_picture: z
    .string()
    .refine(
      (value) => {
        if (!value) return true; // Allow null/undefined

        // Must be a valid data URL for JPEG images
        if (!value.startsWith("data:image/jpeg;base64,")) {
          return false;
        }

        // Check base64 part is valid
        const base64Part = value.replace("data:image/jpeg;base64,", "");
        try {
          // Validate base64 format
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Part)) {
            return false;
          }

          // Check reasonable size (max 2MB base64 encoded)
          if (base64Part.length > 2 * 1024 * 1024 * 1.4) {
            return false;
          }

          return true;
        } catch {
          return false;
        }
      },
      {
        message:
          "Profile picture must be a valid JPEG image data URL under 2MB",
      }
    )
    .nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  ...addressSchema.shape,
});

export type Caregiver = z.infer<typeof caregiverSchema>;
