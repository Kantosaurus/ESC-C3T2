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
    | "address"
    | "address_details"
  >
) =>
  db
    .query(
      `INSERT INTO caregivers (
        id, name, date_of_birth, gender, phone, address, 
        street_address, unit_number, postal_code, city, state, country, latitude, longitude,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.date_of_birth,
        caregiverDetails.gender,
        caregiverDetails.phone,
        caregiverDetails.address,
        caregiverDetails.address_details?.street_address || null,
        caregiverDetails.address_details?.unit_number || null,
        caregiverDetails.address_details?.postal_code || null,
        caregiverDetails.address_details?.city || null,
        caregiverDetails.address_details?.state || null,
        caregiverDetails.address_details?.country || null,
        caregiverDetails.address_details?.latitude || null,
        caregiverDetails.address_details?.longitude || null,
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
    | "address"
    | "address_details"
  >
) =>
  db
    .query(
      `UPDATE caregivers SET
        name = $2,
        date_of_birth = $3,
        gender = $4,
        phone = $5,
        address = $6,
        street_address = $7,
        unit_number = $8,
        postal_code = $9,
        city = $10,
        state = $11,
        country = $12,
        latitude = $13,
        longitude = $14,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        caregiverDetails.id,
        caregiverDetails.name,
        caregiverDetails.date_of_birth,
        caregiverDetails.gender,
        caregiverDetails.phone,
        caregiverDetails.address,
        caregiverDetails.address_details?.street_address || null,
        caregiverDetails.address_details?.unit_number || null,
        caregiverDetails.address_details?.postal_code || null,
        caregiverDetails.address_details?.city || null,
        caregiverDetails.address_details?.state || null,
        caregiverDetails.address_details?.country || null,
        caregiverDetails.address_details?.latitude || null,
        caregiverDetails.address_details?.longitude || null,
      ]
    )
    .then((result) => z.array(caregiverSchema).parse(result)[0]);
