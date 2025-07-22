import { db } from "../db/db";
import { Appointment, appointmentSchema } from "@carely/core";
import z from "zod/v4";

export const insertAppointment = (
  appt: Pick<
    Appointment,
    "elder_id" | "startDateTime" | "endDateTime" | "details" | "name"
  >
) =>
  db
    .query(
      `INSERT INTO appointments (elder_id, startDateTime, endDateTime, details, name)
       VALUES ($1, $2, $3, $4,$5)
       RETURNING id, elder_id, startDateTime as "startDateTime", endDateTime as "endDateTime", details, name`,
      [
        appt.elder_id,
        appt.startDateTime,
        appt.endDateTime,
        appt.details,
        appt.name,
      ]
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
      `SELECT id, elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details, name
      FROM appointments
      WHERE elder_id = $1;`,
      [elder_id]
    )
    .then((result) => {
      const rows = result.rows || result;
      console.log("Fetched:", rows);
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema).parse(rows);
    });

export const deleteAppointment = (
  appt: Pick<Appointment, "elder_id" | "startDateTime" | "endDateTime">
) =>
  db
    .query(
      `DELETE FROM appointments 
      WHERE elder_id = $1 AND startDateTime = $2 AND endDateTime = $3`,
      [appt.elder_id, appt.startDateTime, appt.endDateTime]
    )
    .then((result) => {
      console.log("Appointment deleted:", result);
      if (result.rowCount == 0) {
        throw new Error("Row not found or already deleted");
      }
    });

/*
export const updateAppointment = (
  appt: Pick<
    Appointment,
    "elder_id" | "startDateTime" | "endDateTime" | "details" | "name"
  >
) =>
  db
    .query(
      `UPDATE appointments
       SET details = $1,
           name = $2
       WHERE elder_id = $3 AND startDateTime = $4 AND endDateTime = $5
       RETURNING id, elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details, name`,
      [
        appt.details,
        appt.name,
        appt.elder_id,
        appt.startDateTime,
        appt.endDateTime,
      ]
    )
    .then((result) => {
      console.log("Appointment updated:", result);
      const rows = result.rows || result;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Appointment not found or update failed");
      }
      return appointmentSchema.parse(rows[0]);
    });
*/
