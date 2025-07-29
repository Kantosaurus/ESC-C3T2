import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import {
  validateCreateCaregiver,
  validateUpdateCaregiver,
  validateCreateElder,
  validateUpdateElder,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateNote,
  validateUpdateNote,
  validateDeleteNote,
  validateDeleteAppointment,
  validateAcceptAppointment,
  validateElderIdParam,
  validateCaregiverIdParam,
  validateAppointmentParams,
  VALIDATION_SCHEMAS,
} from "./input-validation";

describe("Input Validation Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("validateCreateCaregiver", () => {
    it("should validate correct caregiver data", () => {
      req.body = {
        name: "John Doe",
        date_of_birth: "1990-01-01",
        gender: "male",
        phone: "91234567",
        street_address: "123 Main St",
        unit_number: "A1",
        postal_code: "123456",
        latitude: 1.234,
        longitude: 103.456,
      };
      validateCreateCaregiver(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject invalid phone number", () => {
      req.body = {
        name: "John Doe",
        date_of_birth: "1990-01-01",
        gender: "male",
        phone: "12345678", // Invalid format
      };
      validateCreateCaregiver(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "phone",
            message:
              "Phone number must be exactly 8 digits and start with 9, 8, or 6",
          }),
        ]),
      });
    });

    it("should reject invalid gender", () => {
      req.body = {
        name: "John Doe",
        phone: "81234567",
        date_of_birth: "1990-01-01",
        gender: "invalid",
      };
      validateCreateCaregiver(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [
          {
            field: "gender",
            message: 'Invalid option: expected one of "male"|"female"|"other"',
          },
        ],
      });
    });
  });

  describe("validateCreateElder", () => {
    it("should validate correct elder data", () => {
      req.body = {
        name: "Jane Doe",
        date_of_birth: "1950-01-01",
        gender: "female",
        phone: "81234567",
        street_address: "456 Elder St",
        unit_number: "B2",
        postal_code: "654321",
        latitude: 1.345,
        longitude: 103.567,
      };
      validateCreateElder(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject invalid phone number", () => {
      req.body = {
        name: "Jane Doe",
        date_of_birth: "1950-01-01",
        gender: "female",
        phone: "12345678", // Invalid format
      };
      validateCreateElder(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "phone",
            message:
              "Phone number must be a valid Singapore number starting with 6, 8, or 9",
          }),
        ]),
      });
    });
  });

  describe("validateCreateAppointment", () => {
    it("should validate correct appointment data", () => {
      req.body = {
        elder_id: 1,
        name: "Doctor Appointment",
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T11:00:00Z",
        location: "Medical Center",
        details: "Regular checkup",
      };
      validateCreateAppointment(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject negative elder_id", () => {
      req.body = {
        elder_id: -1,
        name: "Doctor Appointment",
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T11:00:00Z",
      };
      validateCreateAppointment(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [
          {
            field: "elder_id",
            message: "Elder ID must be a positive number",
          },
        ],
      });
    });
  });

  describe("validateCreateNote", () => {
    it("should validate correct note data", () => {
      req.body = {
        elder_id: 1,
        header: "Medical Note",
        content: "Patient showed improvement in mobility",
      };
      validateCreateNote(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject note with header too long", () => {
      req.body = {
        elder_id: 1,
        header: "A".repeat(51), // 51 characters, exceeds limit of 50
        content: "Note content",
      };
      validateCreateNote(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "header",
            message: "Note header must be at most 50 characters",
          }),
        ]),
      });
    });
  });

  describe("validateElderIdParam", () => {
    it("should validate correct elder ID", () => {
      req.params = { elderId: "123" };
      validateElderIdParam(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(req.params.elderId).toBe(123);
    });

    it("should reject negative elder ID", () => {
      req.params = { elderId: "-1" };
      validateElderIdParam(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid parameters",
        details: [
          {
            field: "elderId",
            message: "Elder ID must be a positive number",
          },
        ],
      });
    });
  });

  describe("validateCaregiverIdParam", () => {
    it("should validate correct caregiver ID", () => {
      req.params = { caregiverId: "user123" };
      validateCaregiverIdParam(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject empty caregiver ID", () => {
      req.params = { caregiverId: "" };
      validateCaregiverIdParam(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid parameters",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "caregiverId",
            message: "Caregiver ID is required",
          }),
        ]),
      });
    });
  });

  describe("validateAppointmentParams", () => {
    it("should validate correct appointment parameters", () => {
      req.params = { elder_id: "123", appt_id: "456" };
      validateAppointmentParams(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(req.params.elder_id).toBe(123);
      expect(req.params.appt_id).toBe(456);
    });

    it("should reject invalid appointment parameters", () => {
      req.params = { elder_id: "0", appt_id: "-1" };
      validateAppointmentParams(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid parameters",
        details: [
          {
            field: "elder_id",
            message: "Elder ID must be a positive number",
          },
          {
            field: "appt_id",
            message: "Appointment ID must be a positive number",
          },
        ],
      });
    });
  });

  describe("validateDeleteNote", () => {
    it("should validate correct note deletion", () => {
      req.body = { note_id: 123 };
      validateDeleteNote(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(req.body.note_id).toBe(123);
    });

    it("should reject negative note ID", () => {
      req.body = { note_id: -1 };
      validateDeleteNote(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [
          {
            field: "note_id",
            message: "Note ID must be a positive number",
          },
        ],
      });
    });
  });

  describe("validateAcceptAppointment", () => {
    it("should validate correct appointment acceptance", () => {
      req.body = { appointment_id: 123, accepted: true };
      validateAcceptAppointment(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject invalid appointment ID", () => {
      req.body = { appointment_id: 0, accepted: false };
      validateAcceptAppointment(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation failed",
        details: [
          {
            field: "appointment_id",
            message: "Appointment ID must be a positive number",
          },
        ],
      });
    });
  });

  describe("Validation Schemas", () => {
    it("should export all validation schemas", () => {
      expect(VALIDATION_SCHEMAS).toHaveProperty("createCaregiverSchema");
      expect(VALIDATION_SCHEMAS).toHaveProperty("createElderSchema");
      expect(VALIDATION_SCHEMAS).toHaveProperty("createAppointmentSchema");
      expect(VALIDATION_SCHEMAS).toHaveProperty("createNoteSchema");
      expect(VALIDATION_SCHEMAS).toHaveProperty("elderIdParamSchema");
      expect(VALIDATION_SCHEMAS).toHaveProperty("caregiverIdParamSchema");
      expect(VALIDATION_SCHEMAS).toHaveProperty("appointmentParamsSchema");
    });
  });
});
