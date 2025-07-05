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
        id, name, date_of_birth, gender, phone, 
        street_address, unit_number, postal_code, latitude, longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.date_of_birth,
        caregiverDetails.gender,
        caregiverDetails.phone,
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
        street_address = $6,
        unit_number = $7,
        postal_code = $8,
        latitude = $9,
        longitude = $10,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.date_of_birth,
        caregiverDetails.gender,
        caregiverDetails.phone,
        caregiverDetails.street_address,
        caregiverDetails.unit_number,
        caregiverDetails.postal_code,
        caregiverDetails.latitude,
        caregiverDetails.longitude,
      ]
    )
    .then((result) => z.array(caregiverSchema).parse(result)[0]);
