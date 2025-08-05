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

export const getEldersDetails = (caregiverId: string) => {
  console.log("Querying elders for caregiver ID:", caregiverId);
  return db
    .query(
      `
			SELECT *
			FROM elders e
			INNER JOIN caregiver_elder ce ON e.id = ce.elder_id
			WHERE ce.caregiver_id = $1;
			`,
      [caregiverId]
    )
    .then((result) => {
      console.log("Database query result:", result);
      return z.array(elderSchema).parse(result);
    })
    .catch((error) => {
      console.error("Database query error:", error);
      throw error;
    });
};

export const insertElder = (caregiverId: string, elderData: NewElderDto) =>
  db
    .query(
      `
        INSERT INTO elders (
          name, date_of_birth, gender, phone,
          street_address, unit_number, postal_code, latitude, longitude
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `,
      [
        elderData.name,
        elderData.date_of_birth,
        elderData.gender,
        elderData.phone,
        elderData.street_address || null,
        elderData.unit_number || null,
        elderData.postal_code || null,
        elderData.latitude || null,
        elderData.longitude || null,
      ]
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

export const updateElder = (elderId: number, elderData: NewElderDto) =>
  db
    .query(
      `
        UPDATE elders 
        SET 
          name = $1, 
          date_of_birth = $2, 
          gender = $3, 
          phone = $4, 
          street_address = $5, 
          unit_number = $6, 
          postal_code = $7,
          latitude = $8, 
          longitude = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *;
      `,
      [
        elderData.name,
        elderData.date_of_birth,
        elderData.gender,
        elderData.phone,
        elderData.street_address || null,
        elderData.unit_number || null,
        elderData.postal_code || null,
        elderData.latitude || null,
        elderData.longitude || null,
        elderId,
      ]
    )
    .then((result) => {
      if (result.length === 0) {
        throw new Error("Elder not found.");
      }
      return elderSchema.parse(result[0]);
    });

export const deleteElder = (elderId: number, caregiverId: string) =>
  db
    .query(
      `
        DELETE FROM caregiver_elder 
        WHERE elder_id = $1 AND caregiver_id = $2;
      `,
      [elderId, caregiverId]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        throw new Error("Elder relationship not found or unauthorized.");
      }
      // Delete notes associated with the elder
      return db
        .query(
          `
            DELETE FROM notes 
            WHERE assigned_elder_id = $1;
          `,
          [elderId]
        )
        .then(() =>
          // Delete appointments associated with the elder
          db.query(
            `
              DELETE FROM appointments 
              WHERE elder_id = $1;
            `,
            [elderId]
          )
        )
        .then(() =>
          // Finally delete the elder
          db.query(
            `
              DELETE FROM elders 
              WHERE id = $1;
            `,
            [elderId]
          )
        )
        .then((deleteResult) => {
          if (deleteResult.rowCount === 0) {
            throw new Error("Elder not found.");
          }
          return { success: true, message: "Elder deleted successfully" };
        });
    });
