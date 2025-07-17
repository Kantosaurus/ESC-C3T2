import { appointmentSchema } from "@carely/core";
import {
  insertAppointment,
  getAppointmentsForElder,
  deleteAppointment,
} from "./appointment.entity";
import { authenticated } from "../auth/guard";
import z from "zod/v4";

export const createAppointmentHandler = authenticated(async (req, res) => {
  console.log("at createAppointmentHandler");
  const appt = appointmentSchema.parse(req.body);
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

  const appts = await getAppointmentsForElder(elder_id);
  res.json(appts);
});

export const deleteAppointmentHandler = authenticated(async (req, res) => {
  const apptToDelete = z
    .object({
      elder_id: z.number(),
      startDateTime: z.coerce.date(),
      endDateTime: z.coerce.date(),
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
