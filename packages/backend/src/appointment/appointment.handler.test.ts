import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  _createAppointmentHandler,
  updateAppointmentHandler,
  _acceptAppointmentHandler,
  _declineAppointmentHandler,
  _getPendingAppointmentsHandler,
  _getDeclinedAppointmentsHandler,
} from "./appointment.handler";
import * as entity from "./appointment.entity";
import type { Request, Response } from "express";

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

vi.mock("./appointment.entity");

describe("createAppointmentHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Mocks a request that overlaps with an existing appointment (10:00–11:00 overlaps with 10:30–11:30) Reject due to clash
  it("should reject overlapping appointments", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        startDateTime: "2025-07-23T10:00:00.000Z",
        endDateTime: "2025-07-23T11:00:00.000Z",
        name: "Test",
      },
    };
    const res = mockRes();

    vi.spyOn(entity, "getAppointmentsForElder").mockResolvedValue([
      {
        elder_id: 1,
        name: "Existing",
        startDateTime: new Date("2025-07-23T10:30:00.000Z"),
        endDateTime: new Date("2025-07-23T11:30:00.000Z"),
        created_by: "",
      },
    ]);

    await _createAppointmentHandler(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Appointment clashes with an existing appointment",
    });
  });

  // Valid creation
  it("should create appointment if no clash", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        startDateTime: "2025-07-23T08:00:00.000Z",
        endDateTime: "2025-07-23T09:00:00.000Z",
        name: "New Appt",
      },
    };
    const res = mockRes();

    vi.spyOn(entity, "getAppointmentsForElder").mockResolvedValue([]);
    vi.spyOn(entity, "insertAppointment").mockResolvedValue({
      ...req.body,
      id: 1,
    });

    await _createAppointmentHandler(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...req.body,
      id: 1,
    });
  });

  // Mocks a request where start timing is greater than end timing
  it("should reject if endDateTime is before startDateTime", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 99,
        startDateTime: "2025-07-23T12:00:00.000Z",
        endDateTime: "2025-07-23T11:00:00.000Z",
        name: "Invalid Time",
        details: null,
        loc: null,
      },
    };
    const res = mockRes();

    vi.spyOn(entity, "getAppointmentsForElder").mockResolvedValue([]);

    await _createAppointmentHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Appointment end must be after start",
    });
  });

  // Mock an edit where start time is greater than endtime
  it("should reject if endDateTime is before startDateTime", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 99,
        startDateTime: "2025-07-23T12:00:00.000Z",
        endDateTime: "2025-07-23T11:00:00.000Z",
        name: "Invalid Time",
        details: null,
        loc: null,
      },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(entity, "getAppointmentsForElder").mockResolvedValue([]);

    await updateAppointmentHandler(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Appointment end must be after start",
    });
  });

  // Mocks an edit that overlaps with an existing appointment (10:00–11:00 overlaps with 10:30–11:30) Reject due to clash
  it("should reject any overlapping appointments after edit", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 123,
        startDateTime: "2025-07-23T10:00:00.000Z",
        endDateTime: "2025-07-23T11:00:00.000Z",
        name: "Test",
        details: null,
        loc: null,
      },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(entity, "getAppointmentsForElder").mockResolvedValue([
      {
        appt_id: 456, // simulate another existing appointment
        elder_id: 1,
        name: "Existing",
        startDateTime: new Date("2025-07-23T10:30:00.000Z"),
        endDateTime: new Date("2025-07-23T11:30:00.000Z"),
        created_by: "",
      },
    ]);

    await updateAppointmentHandler(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Appointment clashes with an existing appointment",
    });
  });

  // Mock an edit that is valid
  it("should update appointment if all is valid", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 123,
        startDateTime: "2025-07-23T08:00:00.000Z",
        endDateTime: "2025-07-23T09:00:00.000Z",
        name: "New Appt",
        details: null,
        loc: null,
      },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(entity, "getAppointmentsForElder").mockResolvedValue([]);
    vi.spyOn(entity, "updateAppointment").mockResolvedValue({
      ...req.body,
      id: 1,
    });

    await updateAppointmentHandler(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...req.body,
      id: 1,
    });
  });
});

describe("getPendingAppointmentsHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return pending appointments for caregiver", async () => {
    const req: Partial<Request> = {};
    const res = mockRes();
    res.locals = { user: { userId: "testcaregiver" } };

    const mockPendingAppts = [
      {
        appt_id: 1,
        elder_id: 1,
        name: "Doctor Visit",
        startDateTime: new Date("2025-07-23T10:00:00.000Z"),
        endDateTime: new Date("2025-07-23T11:00:00.000Z"),
        accepted: null,
        created_by: "testcaregiver",
      },
      {
        appt_id: 2,
        elder_id: 2,
        name: "Physical Therapy",
        startDateTime: new Date("2025-07-24T14:00:00.000Z"),
        endDateTime: new Date("2025-07-24T15:00:00.000Z"),
        accepted: "testcaregiver2",
        created_by: "testcaregiver",
      },
    ];

    vi.spyOn(entity, "getPendingAppointments").mockResolvedValue(
      mockPendingAppts
    );

    await _getPendingAppointmentsHandler(req as Request, res as Response);

    expect(entity.getPendingAppointments).toHaveBeenCalledWith("testcaregiver");
    expect(res.json).toHaveBeenCalledWith(mockPendingAppts);
  });

  it("should handle empty pending appointments", async () => {
    const req: Partial<Request> = {};
    const res = mockRes();
    res.locals = { user: { userId: "testcaregiver" } };

    vi.spyOn(entity, "getPendingAppointments").mockResolvedValue([]);

    await _getPendingAppointmentsHandler(req as Request, res as Response);

    expect(entity.getPendingAppointments).toHaveBeenCalledWith("testcaregiver");
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("acceptAppointmentHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should accept appointment when not already accepted and undo is false", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 123,
        undo: false,
      },
    };
    const res = mockRes();
    res.locals = { user: { userId: "testcaregiver" } };

    const mockAppointment = {
      appt_id: 123,
      elder_id: 1,
      accepted: null,
      startDateTime: new Date("2025-07-23T10:00:00.000Z"),
      endDateTime: new Date("2025-07-23T11:00:00.000Z"),
      name: "Test Appointment",
      created_by: "otherguy",
    };

    const mockAcceptedAppointment = {
      accepted: "testcaregiver",
    };

    vi.spyOn(entity, "getAppointmentForElder").mockResolvedValue(
      mockAppointment
    );
    vi.spyOn(entity, "acceptAppointment").mockResolvedValue(
      mockAcceptedAppointment
    );

    await _acceptAppointmentHandler(req as Request, res as Response);

    expect(entity.getAppointmentForElder).toHaveBeenCalledWith(1, 123);
    expect(entity.acceptAppointment).toHaveBeenCalledWith(
      "testcaregiver",
      1,
      123
    );
    expect(res.json).toHaveBeenCalledWith(mockAcceptedAppointment);
  });

  it("should undo accept when undo is true", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 123,
        undo: true,
      },
    };
    const res = mockRes();
    res.locals = { user: { userId: "testcaregiver" } };

    const mockAppointment = {
      appt_id: 123,
      elder_id: 1,
      accepted: "testcaregiver",
      startDateTime: new Date("2025-07-23T10:00:00.000Z"),
      endDateTime: new Date("2025-07-23T11:00:00.000Z"),
      name: "Test Appointment",
      created_by: "otherguy",
    };

    const mockUndoneAppointment = {
      accepted: null,
    };

    vi.spyOn(entity, "getAppointmentForElder").mockResolvedValue(
      mockAppointment
    );
    vi.spyOn(entity, "acceptAppointment").mockResolvedValue(
      mockUndoneAppointment
    );

    await _acceptAppointmentHandler(req as Request, res as Response);

    expect(entity.getAppointmentForElder).toHaveBeenCalledWith(1, 123);
    expect(entity.acceptAppointment).toHaveBeenCalledWith(null, 1, 123);
    expect(res.json).toHaveBeenCalledWith(mockUndoneAppointment);
  });

  it("should not set caregiver_id when appointment is already accepted and undo is false", async () => {
    const req: Partial<Request> = {
      body: {
        elder_id: 1,
        appt_id: 123,
        undo: false,
      },
    };
    const res = mockRes();
    res.locals = { user: { userId: "testcaregiver" } };

    const mockAppointment = {
      appt_id: 123,
      elder_id: 1,
      accepted: "testcaregiver2",
      startDateTime: new Date("2025-07-23T10:00:00.000Z"),
      endDateTime: new Date("2025-07-23T11:00:00.000Z"),
      name: "Test Appointment",
      created_by: "otherguy",
    };

    vi.spyOn(entity, "getAppointmentForElder").mockResolvedValue(
      mockAppointment
    );
    vi.spyOn(entity, "acceptAppointment").mockResolvedValue(mockAppointment);

    await _acceptAppointmentHandler(req as Request, res as Response);

    expect(entity.acceptAppointment).toHaveBeenCalledWith(null, 1, 123);
    expect(res.json).toHaveBeenCalledWith(mockAppointment);
  });

  describe("declineAppointmentHandler", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should decline appointment when undo is false", async () => {
      const req: Partial<Request> = {
        body: {
          elder_id: 1,
          appt_id: 123,
          undo: false,
        },
      };
      const res = mockRes();
      res.locals = { user: { userId: "testcaregiver" } };

      const mockDeclinedAppointment = {
        appt_id: 123,
        elder_id: 1,
        startDateTime: new Date("2025-07-23T10:00:00.000Z"),
        endDateTime: new Date("2025-07-23T11:00:00.000Z"),
        name: "Test Appointment",
        declined: ["testcaregiver"],
      };

      vi.spyOn(entity, "declineAppointment").mockResolvedValue(
        mockDeclinedAppointment
      );

      await _declineAppointmentHandler(req as Request, res as Response);

      expect(entity.declineAppointment).toHaveBeenCalledWith(
        "testcaregiver",
        1,
        123
      );
      expect(res.json).toHaveBeenCalledWith(mockDeclinedAppointment);
    });

    it("should undo decline when undo is true", async () => {
      const req: Partial<Request> = {
        body: {
          elder_id: 1,
          appt_id: 123,
          undo: true,
        },
      };
      const res = mockRes();
      res.locals = { user: { userId: "testcaregiver" } };

      const mockUndoDeclineAppointment = {
        appt_id: 123,
        elder_id: 1,
        startDateTime: new Date("2025-07-23T10:00:00.000Z"),
        endDateTime: new Date("2025-07-23T11:00:00.000Z"),
        name: "Test Appointment",
        declined: [],
      };

      vi.spyOn(entity, "undoDeclineAppointment").mockResolvedValue(
        mockUndoDeclineAppointment
      );

      await _declineAppointmentHandler(req as Request, res as Response);

      expect(entity.undoDeclineAppointment).toHaveBeenCalledWith(
        "testcaregiver",
        1,
        123
      );
      expect(res.json).toHaveBeenCalledWith(mockUndoDeclineAppointment);
    });
  });

  describe("_getDeclinedAppointmentsHandler", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should return declined appointment IDs for given elder", async () => {
      const req: Partial<Request> = {
        params: {
          elder_id: "1",
        },
      };
      const res = mockRes();
      res.locals = { user: { userId: "testcaregiver" } };

      const mockDeclinedApptIds = [{ appt_id: 2 }];

      vi.spyOn(entity, "getDeclinedAppointments").mockResolvedValue(
        mockDeclinedApptIds
      );

      await _getDeclinedAppointmentsHandler(req as Request, res as Response);

      expect(entity.getDeclinedAppointments).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDeclinedApptIds);
    });

    it("should return empty array when no declined appointments", async () => {
      const req: Partial<Request> = {
        params: {
          elder_id: "1",
        },
      };
      const res = mockRes();
      res.locals = { user: { userId: "testcaregiver" } };

      vi.spyOn(entity, "getDeclinedAppointments").mockResolvedValue([]);

      await _getDeclinedAppointmentsHandler(req as Request, res as Response);

      expect(entity.getDeclinedAppointments).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});
