import z from "zod/v4";

export const caregiverSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .max(15, "Phone number must be at most 15 characters long")
    .optional(),
  address: z
    .string()
    .max(255, "Address must be at most 255 characters long")
    .optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Caregiver = z.infer<typeof caregiverSchema>;
