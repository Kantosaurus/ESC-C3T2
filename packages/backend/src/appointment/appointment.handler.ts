import { Request, Response } from "express";
import { z } from "zod/v4";
import { appointmentSchema } from "@carely/core";
import {
  insertAppointment,
  getAppointmentsForElder,
  updateAppointment,
  getPendingAppointments,
  acceptAppointment,
} from "./appointment.entity";
import { authenticated } from "../auth/guard";
import { hasElderAccess } from "../auth/authorization";

export const createAppointmentHandler = authenticated(async (req, res) => {
  console.log("at createAppointmentHandler");

  // Use XSS-protected schema for input validation and sanitization
  const appt = appointmentSchema.parse(req.body);
  const caregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(caregiverId, appt.elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  const newStart = new Date(appt.startDateTime).getTime();
  const newEnd = new Date(appt.endDateTime).getTime();
  const existingAppts = await getAppointmentsForElder(appt.elder_id);

  const isClashing = existingAppts?.some((exist) => {
    const existingStart = new Date(exist.startDateTime).getTime();
    const existingEnd = new Date(exist.endDateTime).getTime();
    return newStart < existingEnd && newEnd > existingStart;
  });
  if (isClashing) {
    return res.status(409).json({
      error: "Appointment clashes with an existing appointment",
    });
  }
  if (newStart >= newEnd)
    return res.status(400).json({
      error: "Appointment end must be after start",
    });

  const newAppt = await insertAppointment(appt);
  res.status(201).json(newAppt);
});

export const getAppointmentsHandler = authenticated(async (req, res) => {
  console.log("at getAppointmentsHandler");

  const { elder_id } = z
    .object({
      elder_id: z.string().transform((val) => parseInt(val, 10)),
    })
    .parse(req.params);

  const caregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(caregiverId, elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  const appts = await getAppointmentsForElder(elder_id);
  if (!appts) {
    return res.status(404).json({ error: "No appointments found" });
  }

  res.json(appts);
});

export const getAppointmentHandler = authenticated(async (req, res) => {
  console.log("at getAppointmentHandler");

  const { elder_id, appt_id } = z
    .object({
      elder_id: z.string().transform((val) => parseInt(val, 10)),
      appt_id: z.string().transform((val) => parseInt(val, 10)),
    })
    .parse(req.params);

  const caregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(caregiverId, elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  const appts = await getAppointmentForElder(elder_id, appt_id);
  res.json(appts);
});

export const deleteAppointmentHandler = authenticated(async (req, res) => {
  console.log("at delete");
  const apptToDelete = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
    })
    .parse(req.body);

  const caregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(caregiverId, apptToDelete.elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  try {
    await deleteAppointment(apptToDelete);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(404).json({ error: "Appointment not found or already deleted" });
  }
});

export const updateAppointmentHandler = authenticated(async (req, res) => {
  console.log("at update");

  // Use XSS-protected schema for input validation and sanitization
  const apptToUpdate = appointmentSchema
    .pick({
      elder_id: true,
      startDateTime: true,
      endDateTime: true,
      details: true,
      name: true,
      loc: true,
      appt_id: true,
    })
    .parse(req.body);

  const caregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(caregiverId, apptToUpdate.elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  const start = new Date(apptToUpdate.startDateTime).getTime();
  const end = new Date(apptToUpdate.endDateTime).getTime();
  const existingAppts = await getAppointmentsForElder(apptToUpdate.elder_id);

  const isClashing = existingAppts?.some((exist) => {
    if (exist.appt_id == apptToUpdate.appt_id) return false;
    const existingStart = new Date(exist.startDateTime).getTime();
    const existingEnd = new Date(exist.endDateTime).getTime();
    return start < existingEnd && end > existingStart;
  });

  if (isClashing) {
    return res.status(409).json({
      error: "Appointment clashes with an existing appointment",
    });
  }

  if (start >= end) {
    return res.status(400).json({
      error: "Appointment end must be after start",
    });
  }

  try {
    const updatedAppt = await updateAppointment(apptToUpdate);
    res.status(200).json(updatedAppt);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(404).json({ error: "Appointment not found or update failed" });
  }
});

export const getPendingAppointmentsHandler = authenticated(async (req, res) => {
  try {
    const caregiver_id = res.locals.user.userId;
    const appts = await getPendingAppointments(caregiver_id);
    res.json(appts);
  } catch (error) {
    console.error("Failed to fetch pending appointments:", error);
  }
});

export const acceptAppointmentHandler = authenticated(async (req, res) => {
  console.log("at accept appointment");
  let caregiver_id = null;

  const { elder_id, appt_id, undo } = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
      undo: z.boolean(),
    })
    .parse(req.body);

  const currentCaregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(currentCaregiverId, elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  try {
    if (!undo) {
      caregiver_id = currentCaregiverId;
    }

    const appt = await acceptAppointment(caregiver_id, elder_id, appt_id);
    res.json(appt);
  } catch (error) {
    console.error("Failed to accept appointment:", error);
  }
});

//unwrapped appointment handler 4 testing purposes
export const _createAppointmentHandler = async (
  req: Request,
  res: Response
) => {
  console.log("at createAppointmentHandler");
  const appt = appointmentSchema.parse(req.body);
  const newStart = new Date(appt.startDateTime).getTime();
  const newEnd = new Date(appt.endDateTime).getTime();
  const existingAppts = await getAppointmentsForElder(appt.elder_id);

  const isClashing = existingAppts?.some((exist) => {
    const existingStart = new Date(exist.startDateTime).getTime();
    const existingEnd = new Date(exist.endDateTime).getTime();
    return newStart < existingEnd && newEnd > existingStart;
  });
  if (isClashing) {
    return res.status(409).json({
      error: "Appointment clashes with an existing appointment",
    });
  }
  if (newStart >= newEnd)
    return res.status(400).json({
      error: "Appointment end must be after start",
    });

  const newAppt = await insertAppointment(appt);
  res.status(201).json(newAppt);
};
