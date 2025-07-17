import { db } from "../db/db";
import { Appointment, appointmentSchema } from "@carely/core";
import z from "zod/v4";

export const insertAppointment = (
  appt: Pick<
    Appointment,
    "elder_id" | "startDateTime" | "endDateTime" | "details"
  >
) =>
  db
    .query(
      `INSERT INTO appointments (elder_id, startDateTime, endDateTime, details)
       VALUES ($1, $2, $3, $4)
       RETURNING id, elder_id, startDateTime as "startDateTime", endDateTime as "endDateTime", details`,
      [appt.elder_id, appt.startDateTime, appt.endDateTime, appt.details]
    )
    .then((result) => {
      console.log("Insert Appointment:", result);
      const rows = result.rows || result;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Invalid format");
      }
      return appointmentSchema.parse(rows[0]);
    });

export const getAppointmentsForElder = (elder_id: number) =>
  db
    .query(
      `SELECT id, elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details
      FROM appointments
      WHERE elder_id = $1;`,
      [elder_id]
    )
    .then((result) => {
      const rows = result.rows || result;
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema).parse(rows);
    });
