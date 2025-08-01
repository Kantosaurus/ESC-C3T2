import { db } from "../db/db";
import { Appointment, appointmentSchema } from "@carely/core";
import z from "zod/v4";

export const insertAppointment = (
  appt: Pick<
    Appointment,
    | "elder_id"
    | "startDateTime"
    | "endDateTime"
    | "details"
    | "name"
    | "loc"
    | "created_by"
  >
) =>
  db
    .query(
      `INSERT INTO appointments (elder_id, startDateTime, endDateTime, details, name, loc, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING appt_id, elder_id, startDateTime as "startDateTime", endDateTime as "endDateTime", details, name, loc, created_by`,
      [
        appt.elder_id,
        appt.startDateTime,
        appt.endDateTime,
        appt.details,
        appt.name,
        appt.loc,
        appt.created_by,
      ]
    )
    .then((result) => {
      console.log("Insert Appointment:", result);
      return appointmentSchema.parse(result[0]);
    });

export const getAppointmentsForElder = (elder_id: number) =>
  db
    .query(
      `SELECT appt_id, elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details, name, loc, created_by
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

export const getAppointmentForElder = (elder_id: number, appt_id: number) =>
  db
    .query(
      `SELECT appt_id, elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details, name, loc, accepted, created_by, declined
      FROM appointments
      WHERE elder_id = $1 AND appt_id = $2;`,
      [elder_id, appt_id]
    )
    .then((result) => {
      console.log("Fetched appointment:", result);

      return appointmentSchema.parse(result[0]);
    });

export const getDeclinedAppointments = (elder_id: number) =>
  db
    .query(
      `SELECT a.appt_id
FROM appointments a
WHERE a.elder_id = $1
  AND NOT EXISTS (
    SELECT *
    FROM caregiver_elder ce
    WHERE ce.elder_id = a.elder_id
      AND ce.caregiver_id != ALL(a.declined)
)`,
      [elder_id]
    )
    .then((result) => {
      const rows = result.rows || result;
      console.log("Fetched:", rows);
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema.pick({ appt_id: true })).parse(rows);
    });

export const deleteAppointment = (
  appt: Pick<Appointment, "elder_id" | "appt_id">
) =>
  db
    .query(
      `DELETE FROM appointments 
      WHERE elder_id = $1 AND appt_id = $2`,
      [appt.elder_id, appt.appt_id]
    )
    .then((result) => {
      console.log("Appointment deleted:", result);
      if (result.rowCount == 0) {
        throw new Error("Row not found or already deleted");
      }
    });

export const updateAppointment = (
  appt: Pick<
    Appointment,
    | "name"
    | "details"
    | "startDateTime"
    | "endDateTime"
    | "loc"
    | "elder_id"
    | "appt_id"
  >
) =>
  db
    .query(
      `UPDATE appointments
       SET name = $1,
           details = $2,
           startDateTime = $3,
           endDateTime = $4,
           loc = $5
       WHERE elder_id = $6 AND appt_id = $7
       RETURNING appt_id, elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details, name, loc, created_by`,
      [
        appt.name,
        appt.details,
        appt.startDateTime,
        appt.endDateTime,
        appt.loc,
        appt.elder_id,
        appt.appt_id,
      ]
    )
    .then((result) => {
      console.log("Appointment updated:", result);
      return appointmentSchema.parse(result[0]);
    });

export const getPendingAppointments = (caregiver_id: string) =>
  db
    .query(
      `SELECT a.appt_id, a.elder_id, a.startDateTime AS "startDateTime", 
        a.endDateTime AS "endDateTime", a.details, a.name, a.loc, a.created_by
 FROM appointments a 
 JOIN elders e ON a.elder_id = e.id 
 JOIN caregiver_elder ce ON e.id = ce.elder_id 
 WHERE ce.caregiver_id = $1 AND a.accepted IS NULL`,
      [caregiver_id]
    )
    .then((result) => {
      console.log("Pending Fetched:", result);
      const rows = result.rows || result;
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema).parse(rows);
    });

export const acceptAppointment = (
  caregiver_id: string | null,
  elder_id: number,
  appt_id: number
) =>
  db
    .query(
      `UPDATE appointments
       SET accepted = $1
       WHERE elder_id = $2 AND appt_id = $3
       RETURNING accepted`,
      [caregiver_id, elder_id, appt_id]
    )
    .then((result) => {
      console.log("Accepted:", result);
      const rows = result.rows || result;
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema.pick({ accepted: true })).parse(rows);
    });

export const declineAppointment = (
  caregiver_id: string | null,
  elder_id: number,
  appt_id: number
) =>
  db
    .query(
      `UPDATE appointments
       SET declined = array_append(declined, $1)
       WHERE elder_id = $2 AND appt_id = $3 AND NOT ($1 = ANY(declined))
       RETURNING declined`,
      [caregiver_id, elder_id, appt_id]
    )
    .then((result) => {
      console.log("Declined:", result);
      const rows = result.rows || result;
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema.pick({ declined: true })).parse(rows);
    });

export const undoDeclineAppointment = (
  caregiver_id: string | null,
  elder_id: number,
  appt_id: number
) =>
  db
    .query(
      `UPDATE appointments
       SET declined = array_remove(declined, $1)
       WHERE elder_id = $2 AND appt_id = $3
       RETURNING declined`,
      [caregiver_id, elder_id, appt_id]
    )
    .then((result) => {
      console.log("Declined undo:", result);
      const rows = result.rows || result;
      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema.pick({ declined: true })).parse(rows);
    });
