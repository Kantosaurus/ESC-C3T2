import { db } from "../db/db";
import { appointment, appointmentSchema } from "@carely/core";
import { z } from "zod";

export const insertAppointment = (
  appt: Pick<
    appointment,
    "id" | "elder_id" | "startDateTime" | "endDateTime" | "details"
  >
) =>
  db
    .query(
      `INSERT INTO appointments (id, elder_id, startDateTime, endDateTime, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        appt.id,
        appt.elder_id,
        appt.startDateTime,
        appt.endDateTime,
        appt.details,
      ]
    )
    .then((res) => appointmentSchema.parse(res[0]));

export const getAppointmentsForElder = (elderId: number) =>
  db
    .query(
      `SELECT * FROM appointments WHERE elder_id = $1 ORDER BY startDateTime ASC`,
      [elderId]
    )
    .then((res) => z.array(appointmentSchema).parse(res));
