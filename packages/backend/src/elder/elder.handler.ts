import { authenticated } from "#auth/guard.ts";
import { newElderDtoSchema } from "@carely/core";
import { getElderDetails, insertElder } from "./elder.entity";

/**
 * Handler to get the details of the elders associated with the authenticated caregiver.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 */
export const getElderDetailsHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;
  const elders = await getElderDetails(caregiverId);
  res.json(elders);
});

/**
 * Handler to insert a new elder for the authenticated caregiver.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 */
export const insertElderHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;
  console.log("Inserting new elder for caregiver:", req.body);
  const newElderDto = newElderDtoSchema.parse(req.body);

  console.log(newElderDto);

  // Insert the new elder into the database
  const newElder = await insertElder(caregiverId, newElderDto);

  // Respond with the newly created elder
  res.status(201).json(newElder);
});
