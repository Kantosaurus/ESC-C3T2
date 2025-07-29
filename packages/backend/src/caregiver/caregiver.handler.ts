import {
  getCaregiverDetails,
  insertCaregiver,
  updateCaregiver,
} from "./caregiver.entity";
import { authenticated } from "../auth/guard";
import { xssProtectedCaregiverSchema } from "@carely/core";
import { z } from "zod/v4";

/**
 * Handler to get the details of a specific caregiver by ID.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 * It expects the caregiverId to be passed as a URL parameter.
 */
export const getCaregiverByIdHandler = authenticated(async (req, res) => {
  try {
    const { caregiverId } = z
      .object({ caregiverId: z.string() })
      .parse(req.params);

    const caregiver = await getCaregiverDetails(caregiverId);

    if (!caregiver) {
      res.status(404).json({ error: "Caregiver not found" });
      return;
    }

    res.json(caregiver);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid caregiver ID" });
    } else {
      console.error("Error getting caregiver details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Handler to get the details of the authenticated caregiver.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 */
export const getCaregiverSelfHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;

  // Assuming you have a function to get a caregiver by ID
  const caregiver = await getCaregiverDetails(caregiverId);

  if (!caregiver) {
    res.status(404).json({ error: "Caregiver not found" });
    return;
  }

  res.json(caregiver);
});

/**
 * Handler to insert a new caregiver.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 */
export const insertCaregiverHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;

  // Use XSS-protected schema for input validation and sanitization
  const caregiverDetails = xssProtectedCaregiverSchema
    .pick({
      name: true,
      date_of_birth: true,
      gender: true,
      phone: true,
      street_address: true,
      unit_number: true,
      postal_code: true,
      latitude: true,
      longitude: true,
    })
    .parse(req.body);

  const newCaregiver = await insertCaregiver({
    ...caregiverDetails,
    id: caregiverId,
  });

  if (!newCaregiver) {
    res.status(400).json({ error: "Failed to create caregiver" });
    return;
  }

  res.status(201).json(newCaregiver);
});

/**
 * Handler to update the details of the authenticated caregiver.
 * PATCH /api/caregiver/self
 */
export const updateCaregiverSelfHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;

  // Use XSS-protected schema for input validation and sanitization
  const caregiverDetails = xssProtectedCaregiverSchema
    .pick({
      name: true,
      date_of_birth: true,
      gender: true,
      phone: true,
      street_address: true,
      unit_number: true,
      postal_code: true,
      latitude: true,
      longitude: true,
    })
    .parse(req.body);

  const updatedCaregiver = await updateCaregiver({
    ...caregiverDetails,
    id: caregiverId,
  });

  if (!updatedCaregiver) {
    res.status(400).json({ error: "Failed to update caregiver" });
    return;
  }

  res.status(200).json(updatedCaregiver);
});
