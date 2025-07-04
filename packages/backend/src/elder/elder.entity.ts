import { elderSchema, NewElderDto } from "@carely/core";
import z from "zod/v4";
import { db } from "../db/db";

export const getElderDetails = (caregiverId: string, elderId: number) =>
  db
    .query(
      `
		SELECT *
		FROM elders e
		INNER JOIN caregiver_elder ce ON e.id = ce.elder_id
		WHERE ce.caregiver_id = $1 AND e.id = $2;
		`,
      [caregiverId, elderId]
    )
    .then((result) => {
      if (result.length === 0) {
        throw new Error("Elder not found for the given caregiver.");
      }
      return elderSchema.parse(result[0]);
    });

export const getEldersDetails = (caregiverId: string) =>
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

export const addRelationship = (caregiverId: string, elderId: number) =>
  db.query(
    `
			INSERT INTO caregiver_elder (caregiver_id, elder_id)
			VALUES ($1, $2);
			`,
    [caregiverId, elderId]
  );
