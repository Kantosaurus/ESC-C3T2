import { Caregiver } from "@carely/core";
import { caregiverSchema } from "@carely/core";
import z from "zod/v4";
import { db } from "../db/db";

export const getCaregiverDetails = (userId: string) =>
  db
    .query(`SELECT * FROM caregivers WHERE id = $1`, [userId])
    .then((result) => z.array(caregiverSchema).parse(result)[0]);

export const insertCaregiver = (
  caregiverDetails: Pick<
    Caregiver,
    | "id"
    | "name"
    | "date_of_birth"
    | "gender"
    | "phone"
    | "bio"
    | "profile_picture"
    | "street_address"
    | "unit_number"
    | "postal_code"
    | "latitude"
    | "longitude"
  >
) =>
  db
    .query(
      `INSERT INTO caregivers (
        id, name, date_of_birth, gender, phone, bio, profile_picture,
        street_address, unit_number, postal_code, latitude, longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        phone = EXCLUDED.phone,
        bio = EXCLUDED.bio,
        profile_picture = EXCLUDED.profile_picture,
        street_address = EXCLUDED.street_address,
        unit_number = EXCLUDED.unit_number,
        postal_code = EXCLUDED.postal_code,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        updated_at = NOW()
      RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.date_of_birth,
        caregiverDetails.gender,
        caregiverDetails.phone,
        caregiverDetails.bio || "I'm a happy caregiver :)",
        caregiverDetails.profile_picture,
        caregiverDetails.street_address,
        caregiverDetails.unit_number,
        caregiverDetails.postal_code,
        caregiverDetails.latitude,
        caregiverDetails.longitude,
      ]
    )
    .then((result) => z.array(caregiverSchema).parse(result)[0]);

export const updateCaregiver = (
  caregiverDetails: Pick<
    Caregiver,
    | "id"
    | "name"
    | "date_of_birth"
    | "gender"
    | "phone"
    | "bio"
    | "profile_picture"
    | "street_address"
    | "unit_number"
    | "postal_code"
    | "latitude"
    | "longitude"
  >
) =>
  db
    .query(
      `UPDATE caregivers SET
        name = $2,
        date_of_birth = $3,
        gender = $4,
        phone = $5,
        bio = $6,
        profile_picture = $7,
        street_address = $8,
        unit_number = $9,
        postal_code = $10,
        latitude = $11,
        longitude = $12,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.date_of_birth,
        caregiverDetails.gender,
        caregiverDetails.phone,
        caregiverDetails.bio || "I'm a happy caregiver :)",
        caregiverDetails.profile_picture,
        caregiverDetails.street_address,
        caregiverDetails.unit_number,
        caregiverDetails.postal_code,
        caregiverDetails.latitude,
        caregiverDetails.longitude,
      ]
    )
    .then((result) => z.array(caregiverSchema).parse(result)[0]);

export const deleteCaregiver = (caregiverId: string) =>
  db
    .query(
      `
        DELETE FROM caregiver_elder 
        WHERE caregiver_id = $1;
      `,
      [caregiverId]
    )
    .then(() =>
      db
        .query(
          `
            DELETE FROM caregivers 
            WHERE id = $1;
          `,
          [caregiverId]
        )
        .then((result) => {
          if (result.rowCount === 0) {
            throw new Error("Caregiver not found.");
          }
          return { success: true, message: "Caregiver deleted successfully" };
        })
    );
