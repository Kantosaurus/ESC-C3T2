import { authenticated } from "#auth/guard.js";
import { db } from "#db/db.js";
import { appointmentSchema } from "@carely/core";
import z from "zod/v4";

/**
 * Handler to get upcoming appointments for the authenticated caregiver.
 * It retrieves appointments that are scheduled to start in the future,
 * ordered by their start time, and limited to 10 results.
 */
export const getUpcomingAppointmentsHandler = authenticated(async (_, res) => {
  res.json(await getUpcomingAppointmentsQuery(res.locals.user.userId));
});

const getUpcomingAppointmentsQuery = (userId: string) =>
  db
    .query(
      `
			SELECT appt_id, a.elder_id, startDateTime AS "startDateTime", endDateTime AS "endDateTime", details, name, loc from appointments a
			INNER JOIN caregiver_elder ce ON ce.elder_id = a.elder_id 
			WHERE ce.caregiver_id = $1
			AND a.startDateTime > NOW()
			ORDER BY a.startDateTime ASC
			LIMIT 10;
			`,
      [userId]
    )
    .then((result) => {
      const rows = result.rows || result;

      if (!Array.isArray(rows)) {
        throw new Error("Invalid format");
      }
      return z.array(appointmentSchema).parse(rows);
    });
