import { z } from "zod/v4";
import { Request, Response, NextFunction } from "express";

// Common validation schemas
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const elderIdParamSchema = z.object({
  elderId: z.coerce.number().positive("Elder ID must be a positive number"),
});

export const caregiverIdParamSchema = z.object({
  caregiverId: z.string().min(1, "Caregiver ID is required"),
});

export const appointmentParamsSchema = z.object({
  elder_id: z.coerce.number().positive("Elder ID must be a positive number"),
  appt_id: z.coerce
    .number()
    .positive("Appointment ID must be a positive number"),
});

// Query parameter schemas
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const searchQuerySchema = z.object({
  search: z.string().min(1).max(100).optional(),
});

// Request body schemas for validation
export const createCaregiverSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Gender must be male, female, or other" }),
  }),
  phone: z
    .string()
    .regex(
      /^[986]\d{7}$/,
      "Phone number must be exactly 8 digits and start with 9, 8, or 6"
    )
    .nullish(),
  street_address: z
    .string()
    .max(255, "Street address must be at most 255 characters")
    .nullish(),
  unit_number: z
    .string()
    .max(20, "Unit number must be at most 20 characters")
    .nullish(),
  postal_code: z
    .string()
    .min(6, "Postal code must be at least 6 characters")
    .max(10, "Postal code must be at most 10 characters")
    .nullish(),
  latitude: z.coerce.number().nullish(),
  longitude: z.coerce.number().nullish(),
});

export const updateCaregiverSchema = createCaregiverSchema.partial();

export const createElderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  date_of_birth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Gender must be male, female, or other" }),
  }),
  phone: z
    .string()
    .regex(
      /^[689]\d{7}$/,
      "Phone number must be a valid Singapore number starting with 6, 8, or 9"
    )
    .nullish(),
  street_address: z
    .string()
    .max(255, "Street address must be at most 255 characters")
    .nullish(),
  unit_number: z
    .string()
    .max(20, "Unit number must be at most 20 characters")
    .nullish(),
  postal_code: z
    .string()
    .min(6, "Postal code must be at least 6 characters")
    .max(10, "Postal code must be at most 10 characters")
    .nullish(),
  latitude: z.coerce.number().nullish(),
  longitude: z.coerce.number().nullish(),
});

export const updateElderSchema = createElderSchema.partial();

export const createAppointmentSchema = z.object({
  elder_id: z.coerce.number().positive("Elder ID must be a positive number"),
  name: z
    .string()
    .min(1, "Appointment name is required")
    .max(100, "Appointment name must be at most 100 characters"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters")
    .optional(),
  details: z
    .string()
    .max(1000, "Details must be at most 1000 characters")
    .optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const createNoteSchema = z.object({
  elder_id: z.coerce.number().positive("Elder ID must be a positive number"),
  header: z
    .string()
    .min(1, "Note header is required")
    .max(50, "Note header must be at most 50 characters"),
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be at most 10000 characters"),
});

export const updateNoteSchema = z.object({
  note_id: z.coerce.number().positive("Note ID must be a positive number"),
  header: z
    .string()
    .min(1, "Note header is required")
    .max(50, "Note header must be at most 50 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Note content is required")
    .max(10000, "Note content must be at most 10000 characters")
    .optional(),
});

export const deleteNoteSchema = z.object({
  note_id: z.coerce.number().positive("Note ID must be a positive number"),
});

export const deleteAppointmentSchema = z.object({
  appointment_id: z.coerce
    .number()
    .positive("Appointment ID must be a positive number"),
});

export const acceptAppointmentSchema = z.object({
  appointment_id: z.coerce
    .number()
    .positive("Appointment ID must be a positive number"),
  accepted: z.boolean(),
});

// Google Maps API proxy validation schemas
export const geocodeAddressSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(500, "Address must be at most 500 characters"),
});

export const placesAutocompleteSchema = z.object({
  input: z
    .string()
    .min(1, "Input is required")
    .max(200, "Input must be at most 200 characters"),
});

export const placeDetailsSchema = z.object({
  place_id: z
    .string()
    .min(1, "Place ID is required")
    .max(100, "Place ID must be at most 100 characters"),
});

// Generic validation middleware factory
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Try to get errors from the error object
        let errorDetails = [];

        if (error.errors && Array.isArray(error.errors)) {
          errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
        } else if (error.message) {
          // Try to parse the error message as JSON
          try {
            const parsedErrors = JSON.parse(error.message);
            if (Array.isArray(parsedErrors)) {
              errorDetails = parsedErrors.map((err) => ({
                field: err.path?.join(".") || "unknown",
                message: err.message || "Validation failed",
              }));
            }
          } catch {
            // If parsing fails, create a generic error
            errorDetails = [
              {
                field: "unknown",
                message: error.message || "Validation failed",
              },
            ];
          }
        }

        return res.status(400).json({
          error: "Validation failed",
          details:
            errorDetails.length > 0
              ? errorDetails
              : [{ field: "unknown", message: "Validation failed" }],
        });
      } else {
        return res.status(400).json({
          error: "Validation failed",
          details: [{ field: "unknown", message: "Validation failed" }],
        });
      }
    }
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as Record<string, unknown>;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        let errorDetails = [];

        if (error.errors && Array.isArray(error.errors)) {
          errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
        } else if (error.message) {
          try {
            const parsedErrors = JSON.parse(error.message);
            if (Array.isArray(parsedErrors)) {
              errorDetails = parsedErrors.map((err) => ({
                field: err.path?.join(".") || "unknown",
                message: err.message || "Invalid parameters",
              }));
            }
          } catch {
            errorDetails = [
              {
                field: "unknown",
                message: error.message || "Invalid parameters",
              },
            ];
          }
        }

        return res.status(400).json({
          error: "Invalid parameters",
          details:
            errorDetails.length > 0
              ? errorDetails
              : [{ field: "unknown", message: "Invalid parameters" }],
        });
      } else {
        return res.status(400).json({
          error: "Invalid parameters",
          details: [{ field: "unknown", message: "Invalid parameters" }],
        });
      }
    }
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as Record<string, unknown>;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        let errorDetails = [];

        if (error.errors && Array.isArray(error.errors)) {
          errorDetails = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
        } else if (error.message) {
          try {
            const parsedErrors = JSON.parse(error.message);
            if (Array.isArray(parsedErrors)) {
              errorDetails = parsedErrors.map((err) => ({
                field: err.path?.join(".") || "unknown",
                message: err.message || "Invalid query parameters",
              }));
            }
          } catch {
            errorDetails = [
              {
                field: "unknown",
                message: error.message || "Invalid query parameters",
              },
            ];
          }
        }

        return res.status(400).json({
          error: "Invalid query parameters",
          details:
            errorDetails.length > 0
              ? errorDetails
              : [{ field: "unknown", message: "Invalid query parameters" }],
        });
      } else {
        return res.status(400).json({
          error: "Invalid query parameters",
          details: [{ field: "unknown", message: "Invalid query parameters" }],
        });
      }
    }
  };
};

// Specific validation middleware for common use cases
export const validateIdParam = validateParams(idParamSchema);
export const validateElderIdParam = validateParams(elderIdParamSchema);
export const validateCaregiverIdParam = validateParams(caregiverIdParamSchema);
export const validateAppointmentParams = validateParams(
  appointmentParamsSchema
);
export const validatePaginationQuery = validateQuery(paginationQuerySchema);
export const validateSearchQuery = validateQuery(searchQuerySchema);

// Request body validation middleware
export const validateCreateCaregiver = validateBody(createCaregiverSchema);
export const validateUpdateCaregiver = validateBody(updateCaregiverSchema);
export const validateCreateElder = validateBody(createElderSchema);
export const validateUpdateElder = validateBody(updateElderSchema);
export const validateCreateAppointment = validateBody(createAppointmentSchema);
export const validateUpdateAppointment = validateBody(updateAppointmentSchema);
export const validateCreateNote = validateBody(createNoteSchema);
export const validateUpdateNote = validateBody(updateNoteSchema);
export const validateDeleteNote = validateBody(deleteNoteSchema);
export const validateDeleteAppointment = validateBody(deleteAppointmentSchema);
export const validateAcceptAppointment = validateBody(acceptAppointmentSchema);

// Validation middleware for Google Maps proxy endpoints
export const validateGeocodeAddress = validateQuery(geocodeAddressSchema);
export const validatePlacesAutocomplete = validateQuery(
  placesAutocompleteSchema
);
export const validatePlaceDetails = validateQuery(placeDetailsSchema);

// Export all schemas for testing
export const VALIDATION_SCHEMAS = {
  idParamSchema,
  elderIdParamSchema,
  caregiverIdParamSchema,
  appointmentParamsSchema,
  paginationQuerySchema,
  searchQuerySchema,
  createCaregiverSchema,
  updateCaregiverSchema,
  createElderSchema,
  updateElderSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  deleteAppointmentSchema,
  acceptAppointmentSchema,
  geocodeAddressSchema,
  placesAutocompleteSchema,
  placeDetailsSchema,
};
