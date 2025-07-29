import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  UserRole,
  Permission,
  getUserRole,
  hasPermission,
  hasElderAccess,
  hasNoteAccess,
  hasAppointmentAccess,
  requirePermission,
  requireElderAccess,
  requireNoteAccess,
  requireAppointmentAccess,
  requireSelfAccess,
} from "./authorization";
import { getEldersDetails } from "../elder/elder.entity";
import { getNotesDetails } from "../note/note.entity";
import { getAppointmentsForElder } from "../appointment/appointment.entity";

// Mock the entity functions
jest.mock("../elder/elder.entity");
jest.mock("../note/note.entity");
jest.mock("../appointment/appointment.entity");

const mockGetEldersDetails = getEldersDetails as jest.MockedFunction<
  typeof getEldersDetails
>;
const mockGetNotesDetails = getNotesDetails as jest.MockedFunction<
  typeof getNotesDetails
>;
const mockGetAppointmentsForElder =
  getAppointmentsForElder as jest.MockedFunction<
    typeof getAppointmentsForElder
  >;

describe("Authorization System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("UserRole and Permission enums", () => {
    it("should have correct role values", () => {
      expect(UserRole.CAREGIVER).toBe("caregiver");
      expect(UserRole.ADMIN).toBe("admin");
    });

    it("should have correct permission values", () => {
      expect(Permission.READ_OWN_PROFILE).toBe("read_own_profile");
      expect(Permission.UPDATE_OWN_PROFILE).toBe("update_own_profile");
      expect(Permission.READ_ELDER_PROFILE).toBe("read_elder_profile");
      expect(Permission.CREATE_ELDER_APPOINTMENTS).toBe(
        "create_elder_appointments"
      );
    });
  });

  describe("getUserRole", () => {
    it("should return CAREGIVER role for any user ID", () => {
      expect(getUserRole("user123")).toBe(UserRole.CAREGIVER);
      expect(getUserRole("admin456")).toBe(UserRole.CAREGIVER);
    });
  });

  describe("hasPermission", () => {
    it("should return true for caregiver permissions", () => {
      const userId = "user123";

      expect(hasPermission(userId, Permission.READ_OWN_PROFILE)).toBe(true);
      expect(hasPermission(userId, Permission.UPDATE_OWN_PROFILE)).toBe(true);
      expect(hasPermission(userId, Permission.READ_ELDER_PROFILE)).toBe(true);
      expect(hasPermission(userId, Permission.CREATE_ELDER)).toBe(true);
    });

    it("should return false for restricted permissions", () => {
      const userId = "user123";

      expect(hasPermission(userId, Permission.READ_OTHER_CAREGIVER)).toBe(
        false
      );
    });
  });

  describe("hasElderAccess", () => {
    it("should return true when user has access to elder", async () => {
      const caregiverId = "caregiver123";
      const elderId = 1;

      mockGetEldersDetails.mockResolvedValue([
        { id: 1, name: "Elder 1" } as any,
        { id: 2, name: "Elder 2" } as any,
      ]);

      const result = await hasElderAccess(caregiverId, elderId);

      expect(result).toBe(true);
      expect(mockGetEldersDetails).toHaveBeenCalledWith(caregiverId);
    });

    it("should return false when user does not have access to elder", async () => {
      const caregiverId = "caregiver123";
      const elderId = 3;

      mockGetEldersDetails.mockResolvedValue([
        { id: 1, name: "Elder 1" } as any,
        { id: 2, name: "Elder 2" } as any,
      ]);

      const result = await hasElderAccess(caregiverId, elderId);

      expect(result).toBe(false);
      expect(mockGetEldersDetails).toHaveBeenCalledWith(caregiverId);
    });

    it("should return false when database query fails", async () => {
      const caregiverId = "caregiver123";
      const elderId = 1;

      mockGetEldersDetails.mockRejectedValue(new Error("Database error"));

      const result = await hasElderAccess(caregiverId, elderId);

      expect(result).toBe(false);
    });
  });

  describe("hasNoteAccess", () => {
    it("should return true when user owns the note", async () => {
      const caregiverId = "caregiver123";
      const noteId = 1;

      mockGetNotesDetails.mockResolvedValue([
        { id: 1, header: "Note 1" } as any,
        { id: 2, header: "Note 2" } as any,
      ]);

      const result = await hasNoteAccess(caregiverId, noteId);

      expect(result).toBe(true);
      expect(mockGetNotesDetails).toHaveBeenCalledWith(caregiverId);
    });

    it("should return false when user does not own the note", async () => {
      const caregiverId = "caregiver123";
      const noteId = 3;

      mockGetNotesDetails.mockResolvedValue([
        { id: 1, header: "Note 1" } as any,
        { id: 2, header: "Note 2" } as any,
      ]);

      const result = await hasNoteAccess(caregiverId, noteId);

      expect(result).toBe(false);
    });

    it("should return false when database query fails", async () => {
      const caregiverId = "caregiver123";
      const noteId = 1;

      mockGetNotesDetails.mockRejectedValue(new Error("Database error"));

      const result = await hasNoteAccess(caregiverId, noteId);

      expect(result).toBe(false);
    });
  });

  describe("hasAppointmentAccess", () => {
    it("should return true when user has access to elder and appointment exists", async () => {
      const caregiverId = "caregiver123";
      const elderId = 1;
      const appointmentId = 1;

      mockGetEldersDetails.mockResolvedValue([
        { id: 1, name: "Elder 1" } as any,
      ]);

      mockGetAppointmentsForElder.mockResolvedValue([
        { appt_id: 1, name: "Appointment 1" } as any,
        { appt_id: 2, name: "Appointment 2" } as any,
      ]);

      const result = await hasAppointmentAccess(
        caregiverId,
        elderId,
        appointmentId
      );

      expect(result).toBe(true);
      expect(mockGetEldersDetails).toHaveBeenCalledWith(caregiverId);
      expect(mockGetAppointmentsForElder).toHaveBeenCalledWith(elderId);
    });

    it("should return false when user does not have access to elder", async () => {
      const caregiverId = "caregiver123";
      const elderId = 3;
      const appointmentId = 1;

      mockGetEldersDetails.mockResolvedValue([
        { id: 1, name: "Elder 1" } as any,
      ]);

      const result = await hasAppointmentAccess(
        caregiverId,
        elderId,
        appointmentId
      );

      expect(result).toBe(false);
      expect(mockGetAppointmentsForElder).not.toHaveBeenCalled();
    });

    it("should return false when appointment does not exist for elder", async () => {
      const caregiverId = "caregiver123";
      const elderId = 1;
      const appointmentId = 3;

      mockGetEldersDetails.mockResolvedValue([
        { id: 1, name: "Elder 1" } as any,
      ]);

      mockGetAppointmentsForElder.mockResolvedValue([
        { appt_id: 1, name: "Appointment 1" } as any,
        { appt_id: 2, name: "Appointment 2" } as any,
      ]);

      const result = await hasAppointmentAccess(
        caregiverId,
        elderId,
        appointmentId
      );

      expect(result).toBe(false);
    });
  });

  describe("Authorization Middleware", () => {
    describe("requirePermission", () => {
      it("should call next() when user has permission", () => {
        const middleware = requirePermission(Permission.READ_OWN_PROFILE);
        const req = {} as any;
        const res = { locals: { user: { userId: "user123" } } } as any;
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it("should return 403 when user lacks permission", () => {
        const middleware = requirePermission(Permission.READ_OTHER_CAREGIVER);
        const req = {} as any;
        const res = {
          locals: { user: { userId: "user123" } },
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as any;
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: "Insufficient permissions",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 401 when user is not authenticated", () => {
        const middleware = requirePermission(Permission.READ_OWN_PROFILE);
        const req = {} as any;
        const res = {
          locals: {},
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as any;
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: "Authentication required",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("requireSelfAccess", () => {
      it("should call next() when user accesses their own data", () => {
        const middleware = requireSelfAccess();
        const req = { params: { caregiver_id: "user123" } } as any;
        const res = { locals: { user: { userId: "user123" } } } as any;
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it("should return 403 when user tries to access another user's data", () => {
        const middleware = requireSelfAccess();
        const req = { params: { caregiver_id: "other123" } } as any;
        const res = {
          locals: { user: { userId: "user123" } },
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as any;
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: "Access denied to other users' data",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });
});
