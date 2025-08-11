import { appointmentSchema } from "@carely/core";
import {
  insertAppointment,
  getAppointmentsForElder,
  getAppointmentForElder,
  deleteAppointment,
  updateAppointment,
  getPendingAppointments,
  getAllAppointmentsForCaregiver,
  acceptAppointment,
  declineAppointment,
  undoDeclineAppointment,
  getDeclinedAppointments,
} from "./appointment.entity";

import { getCaregiverDetails } from "#caregiver/caregiver.entity.js";
import { authenticated } from "../auth/guard";
import z from "zod/v4";
import type { Request, Response } from "express";

export const createAppointmentHandler = authenticated(async (req, res) => {
  const caregiver_id = res.locals.user.userId;
  const appt = appointmentSchema.parse({
    created_by: caregiver_id,
    ...req.body,
  });

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
  const { elder_id } = z
    .object({
      elder_id: z.string().transform((val) => parseInt(val, 10)),
    })
    .parse(req.params);

  const appts = await getAppointmentsForElder(elder_id);
  if (!appts) {
    return res.status(404).json({ error: "No appointments found" });
  }

  res.json(appts);
});

export const getAppointmentHandler = authenticated(async (req, res) => {
  const { elder_id, appt_id } = z
    .object({
      elder_id: z.string().transform((val) => parseInt(val, 10)),
      appt_id: z.string().transform((val) => parseInt(val, 10)),
    })
    .parse(req.params);

  const appt = await getAppointmentForElder(elder_id, appt_id);
  res.json(appt);
});

export const deleteAppointmentHandler = authenticated(async (req, res) => {
  const apptToDelete = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
    })
    .parse(req.body);
  try {
    await deleteAppointment(apptToDelete);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(404).json({ error: "Appointment not found or already deleted" });
  }
});

export const updateAppointmentHandler = authenticated(async (req, res) => {
  const apptToUpdate = z
    .object({
      elder_id: z.number(),
      startDateTime: z.coerce.date(),
      endDateTime: z.coerce.date(),
      details: z.string().nullish(),
      name: z.string(),
      loc: z.string().nullish(),
      appt_id: z.number(),
    })
    .parse(req.body);

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

export const getAllAppointmentsForCaregiverHandler = authenticated(
  async (req, res) => {
    try {
      const caregiver_id = res.locals.user.userId;
      const appts = await getAllAppointmentsForCaregiver(caregiver_id);
      res.json(appts);
    } catch (error) {
      console.error("Failed to fetch all appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

export const getDeclinedAppointmentsHandler = authenticated(
  async (req, res) => {
    try {
      const { elder_id } = z
        .object({ elder_id: z.string().transform((val) => parseInt(val, 10)) })
        .parse(req.params);
      const appt_ids = await getDeclinedAppointments(elder_id);
      res.json(appt_ids);
    } catch (error) {
      console.error("Failed to fetch declined appointments:", error);
    }
  }
);

export const acceptAppointmentHandler = authenticated(async (req, res) => {
  let caregiver_id = null;

  const { elder_id, appt_id, undo } = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
      undo: z.boolean(),
    })
    .parse(req.body);

  const checkappt = await getAppointmentForElder(elder_id, appt_id);
  try {
    if (!undo && !checkappt.accepted) {
      caregiver_id = res.locals.user.userId;
    }

    const appt = await acceptAppointment(caregiver_id, elder_id, appt_id);
    res.json(appt);
  } catch (error) {
    console.error("Failed to accept appointment:", error);
  }
});

export const declineAppointmentHandler = authenticated(async (req, res) => {
  const caregiver_id = res.locals.user.userId;

  const { elder_id, appt_id, undo } = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
      undo: z.boolean(),
    })
    .parse(req.body);

  try {
    if (!undo) {
      const appt = await declineAppointment(caregiver_id, elder_id, appt_id);
      res.json(appt);
    } else {
      const appt = await undoDeclineAppointment(
        caregiver_id,
        elder_id,
        appt_id
      );
      res.json(appt);
    }
  } catch (error) {
    console.error("Failed to decline appointment:", error);
  }
});

export const getCaregiverById = authenticated(async (req, res) => {
  const { caregiver_id } = z
    .object({
      caregiver_id: z.string(),
    })
    .parse(req.params);

  const caregiver = await getCaregiverDetails(caregiver_id);

  if (!caregiver) {
    res.status(404).json({ error: "Caregiver not found" });
    return;
  }

  res.json(caregiver);
});

export const importIcsFileHandler = authenticated(async (req, res) => {
  try {
    const caregiver_id = res.locals.user.userId;

    // Get the caregiver's first elder (or create a default one if needed)
    const caregiver = await getCaregiverDetails(caregiver_id);
    if (!caregiver) {
      return res.status(404).json({ error: "Caregiver not found" });
    }

    // Import elder details to get the caregiver's elders
    const { getEldersDetails } = await import("#elder/elder.entity.js");
    const elders = await getEldersDetails(caregiver_id);

    // Use the first elder, or create a special elder for imported appointments
    let elderId = 1; // Default fallback
    if (elders && elders.length > 0) {
      elderId = elders[0].id;
    }

    const icsContent = req.body.icsContent;
    if (!icsContent) {
      return res.status(400).json({ error: "ICS content is required" });
    }

    // Parse the ICS content
    const calendar = ical.parseICS(icsContent);
    const importedAppointments = [];
    const errors = [];

    for (const event of Object.values(calendar)) {
      if (event.type === "VEVENT") {
        const startDate = event.start;
        const endDate =
          event.end ||
          (startDate ? new Date(startDate.getTime() + 60 * 60 * 1000) : null); // Default 1 hour duration
        const summary = event.summary || "Imported Event";
        const description = event.description || "";
        const location = event.location || "";

        if (startDate && endDate) {
          try {
            const appointment = await insertAppointment({
              elder_id: elderId,
              startDateTime: startDate,
              endDateTime: endDate,
              name: summary,
              details: description,
              loc: location,
              created_by: caregiver_id,
            });
            importedAppointments.push(appointment);
          } catch (error) {
            console.error("Error inserting appointment:", error);
            errors.push(`Failed to import: ${summary}`);
            // Continue with other appointments even if one fails
          }
        }
      }
    }

    res.json({
      success: true,
      importedCount: importedAppointments.length,
      errorCount: errors.length,
      errors: errors,
      appointments: importedAppointments,
    });
  } catch (error) {
    console.error("Failed to import ICS file:", error);
    res.status(500).json({ error: "Failed to import ICS file" });
  }
});

//unwrapped appointment handler 4 testing purposes
export const _createAppointmentHandler = async (
  req: Request,
  res: Response
) => {
  const caregiver_id = "testUserId";
  const appt = appointmentSchema.parse({
    created_by: caregiver_id,
    ...req.body,
  });
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

export const _acceptAppointmentHandler = async (
  req: Request,
  res: Response
) => {
  let caregiver_id = null;

  const { elder_id, appt_id, undo } = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
      undo: z.boolean(),
    })
    .parse(req.body);

  const checkappt = await getAppointmentForElder(elder_id, appt_id);
  try {
    if (!undo && !checkappt.accepted) {
      caregiver_id = res.locals.user.userId;
    }

    const appt = await acceptAppointment(caregiver_id, elder_id, appt_id);
    res.json(appt);
  } catch (error) {
    console.error("Failed to accept appointment:", error);
  }
};

export const _declineAppointmentHandler = async (
  req: Request,
  res: Response
) => {
  const caregiver_id = res.locals.user.userId;

  const { elder_id, appt_id, undo } = z
    .object({
      elder_id: z.number(),
      appt_id: z.number(),
      undo: z.boolean(),
    })
    .parse(req.body);

  try {
    if (!undo) {
      const appt = await declineAppointment(caregiver_id, elder_id, appt_id);
      res.json(appt);
    } else {
      const appt = await undoDeclineAppointment(
        caregiver_id,
        elder_id,
        appt_id
      );
      res.json(appt);
    }
  } catch (error) {
    console.error("Failed to decline appointment:", error);
  }
};

export const _getPendingAppointmentsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const caregiver_id = res.locals.user.userId;
    const appts = await getPendingAppointments(caregiver_id);
    res.json(appts);
  } catch (error) {
    console.error("Failed to fetch pending appointments:", error);
  }
};

export const _getDeclinedAppointmentsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { elder_id } = z
      .object({ elder_id: z.string().transform((val) => parseInt(val, 10)) })
      .parse(req.params);
    const appt_ids = await getDeclinedAppointments(elder_id);
    res.json(appt_ids);
  } catch (error) {
    console.error("Failed to fetch declined appointments:", error);
  }
};
