import { db } from "#db/db.ts";
import { Caregiver } from "@carely/core";
import { caregiverSchema } from "@carely/core";
import z from "zod/v4";

export const getCaregiverDetails = (userId: string) =>
  db
    .query(`SELECT * FROM caregivers WHERE id = $1`, [userId])
    .then((result) => z.array(caregiverSchema).parse(result)[0]);

export const insertCaregiver = (
  caregiverDetails: Pick<Caregiver, "id" | "name" | "phone" | "address">
) =>
  db
    .query(
      `INSERT INTO caregivers (id, name, phone, address, created_at, updated_at)
	VALUES ($1, $2, $3, $4, NOW(), NOW())
	RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.phone,
        caregiverDetails.address,
      ]
    )
    .then((result) => z.array(caregiverSchema).parse(result)[0]);
