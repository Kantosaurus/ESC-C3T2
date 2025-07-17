import { appointmentSchema } from "@carely/core";
import {
  insertAppointment,
  getAppointmentsForElder,
} from "./appointment.entity";
import { authenticated } from "../auth/guard";

export const createAppointmentHandler = authenticated(async (req, res) => {
  const appt = appointmentSchema.parse(req.body);
  const newAppt = await insertAppointment(appt);
  res.status(201).json(newAppt);
});

export const getAppointmentsHandler = authenticated(async (req, res) => {
  const elderId = Number(req.params.elderId);
  const appts = await getAppointmentsForElder(elderId);
  res.json(appts);
});

export const insertAppointmentHandler = authenticated(async (req, res) => {
  try {
    const appt = appointmentSchema.parse(req.body);
    const saved = await insertAppointment(appt);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid appointment data", details: err });
  }
});
