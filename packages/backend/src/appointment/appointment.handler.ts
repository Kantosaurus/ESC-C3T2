import { appointmentSchema } from "@carely/core";
import {
  insertAppointment,
  getAppointmentsForElder,
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
