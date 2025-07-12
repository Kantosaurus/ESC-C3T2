import { caregiverSchema } from "@carely/core";
import {
  getCaregiverDetails,
  insertCaregiver,
  updateCaregiver,
} from "./caregiver.entity";
import { authenticated } from "../auth/guard";

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

  const caregiverDetails = caregiverSchema
    .pick({
      name: true,
      date_of_birth: true,
      gender: true,
      phone: true,
      address: true,
      address_details: true,
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

  const caregiverDetails = caregiverSchema
    .pick({
      name: true,
      date_of_birth: true,
      gender: true,
      phone: true,
      address: true,
      address_details: true,
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
