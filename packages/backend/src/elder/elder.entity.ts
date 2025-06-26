import { db } from "#db/db.ts";
import { elderSchema, NewElderDto } from "@carely/core";
import z from "zod/v4";

export const getElderDetails = (caregiverId: string) =>
  db
    .query(
      `
			SELECT *
			FROM elders e
			INNER JOIN caregiver_elder ce ON e.id = ce.elder_id
			WHERE ce.caregiver_id = $1;
			`,
      [caregiverId]
    )
    .then((result) => z.array(elderSchema).parse(result));

export const insertElder = (caregiverId: string, elderData: NewElderDto) =>
  db
    .query(
      `
			INSERT INTO elders (name, phone, address)
			VALUES ($1, $2, $3)
			RETURNING *;
			`,
      [elderData.name, elderData.phone, elderData.address]
    )
    .then((result) => {
      const newElder = elderSchema.parse(result[0]);
      return db
        .query(
          `
				INSERT INTO caregiver_elder (caregiver_id, elder_id)
				VALUES ($1, $2);
				`,
          [caregiverId, newElder.id]
        )
        .then(() => newElder);
    });
