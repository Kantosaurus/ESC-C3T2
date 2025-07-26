import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  _createAppointmentHandler,
  updateAppointmentHandler,
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
