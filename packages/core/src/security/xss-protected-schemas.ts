import z from "zod/v4";

// XSS Protection transformers
const sanitizeText = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }
  // Basic HTML removal - in production, use DOMPurify
  return input.replace(/<[^>]*>/g, "").trim();
};

const sanitizeRichText = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }
  // Allow basic formatting but remove scripts
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
};

const sanitizeAddress = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }
  const sanitized = sanitizeText(input);
  return sanitized.length > 200 ? sanitized.substring(0, 200) : sanitized;
};

const sanitizeName = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }
  const sanitized = sanitizeText(input);
  return sanitized.length > 100 ? sanitized.substring(0, 100) : sanitized;
};

const sanitizePhone = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }
  const sanitized = sanitizeText(input);
  // Only allow digits, spaces, dashes, parentheses, and plus sign
  return sanitized.replace(/[^\d\s\-()]/g, "");
};

// XSS-Protected Address Schema
export const xssProtectedAddressSchema = z.object({
  street_address: z.string().transform(sanitizeAddress).optional(),
  unit_number: z.string().transform(sanitizeText).optional(),
  postal_code: z.string().transform(sanitizeText).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// XSS-Protected Caregiver Schema
export const xssProtectedCaregiverSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").transform(sanitizeName),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  phone: z
    .string()
    .regex(
      /^[986]\d{7}$/,
      "Phone number must be exactly 8 digits and start with 9, 8, or 6"
    )
    .max(15, "Phone number must be at most 15 characters long")
    .transform(sanitizePhone)
    .nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  ...xssProtectedAddressSchema.shape,
});

// XSS-Protected Elder Schema
export const xssProtectedElderSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required").transform(sanitizeName),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  phone: z
    .string()
    .max(15, "Phone number must be at most 15 characters long")
    .regex(
      /^[689]\d{7}$/,
      "Phone number must be a valid Singapore number starting with 6, 8, or 9"
    )
    .transform(sanitizePhone)
    .nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  ...xssProtectedAddressSchema.shape,
});

// XSS-Protected Note Schema
export const xssProtectedNoteSchema = z.object({
  id: z.coerce.number(),
  header: z
    .string()
    .max(80, "Header must be at most 80 characters long")
    .transform(sanitizeText),
  content: z
    .string()
    .max(5000, "Content must be at most 5000 characters long")
    .transform(sanitizeRichText)
    .nullish(),
  caregiver_id: z.coerce.string(),
  assigned_elder_id: z.coerce.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

// XSS-Protected Appointment Schema
export const xssProtectedAppointmentSchema = z.object({
  appt_id: z.coerce.number().optional(),
  elder_id: z.coerce.number(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  details: z.string().transform(sanitizeRichText).nullish(),
  name: z.string().transform(sanitizeName),
  loc: z.string().transform(sanitizeAddress).nullish(),
  accepted: z.string().nullish(),
});

// XSS-Protected DTOs
export const xssProtectedNewElderDtoSchema = xssProtectedElderSchema.pick({
  name: true,
  date_of_birth: true,
  gender: true,
  phone: true,
  street_address: true,
  unit_number: true,
  postal_code: true,
  longitude: true,
  latitude: true,
});

export const xssProtectedNewNoteDtoSchema = xssProtectedNoteSchema.pick({
  header: true,
  content: true,
  assigned_elder_id: true,
});

// Export types
export type XSSProtectedCaregiver = z.infer<typeof xssProtectedCaregiverSchema>;
export type XSSProtectedElder = z.infer<typeof xssProtectedElderSchema>;
export type XSSProtectedNote = z.infer<typeof xssProtectedNoteSchema>;
export type XSSProtectedAppointment = z.infer<
  typeof xssProtectedAppointmentSchema
>;
export type XSSProtectedNewElderDto = z.infer<
  typeof xssProtectedNewElderDtoSchema
>;
export type XSSProtectedNewNoteDto = z.infer<
  typeof xssProtectedNewNoteDtoSchema
>;
