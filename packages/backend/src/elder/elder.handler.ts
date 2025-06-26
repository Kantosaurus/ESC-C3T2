import { authenticated } from "#auth/guard.ts";
import { elderSchema, newElderDtoSchema } from "@carely/core";
import { addRelationship, getElderDetails, insertElder } from "./elder.entity";
import z from "zod/v4";
import { jwtVerify, SignJWT } from "jose";
import { jwtSecret } from "#auth/secret.ts";
import { JOSEError } from "jose/errors";

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

/**
 * Handler to generate an invite link for an elder.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 */
export const getInviteLinkHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;
  const elderId = elderSchema.shape.id.parse(req.query.elderId);

  // Check that the caregiver is authorized to create an invite link
  const elders = await getElderDetails(caregiverId);

  const thisElder = elders.find((e) => e.id === elderId);

  if (!thisElder) {
    res.status(403).json({
      error: "You are not authorized to create an invite link for this elder.",
    });
    return;
  }

  // Sign a JWT token with the elder ID
  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("carely")
    .setAudience("carely")
    .setSubject(elderId.toString())
    .setExpirationTime("1h")
    .setSubject(`invite-${elderId}`)
    .sign(jwtSecret);

  const url = new URL(
    "/invite",
    process.env.FRONTEND_HOST || "http://localhost:3000"
  );

  url.searchParams.set("token", encodeURIComponent(btoa(token)));
  url.searchParams.set("elderName", thisElder.name);

  res.json({ inviteLink: url.toString(), elderId });
});

/**
 * Handler to create a relationship between a caregiver and an elder.
 * This handler assumes that the user is already authenticated and
 * their user ID is available in `res.locals.user.userId`.
 * It expects a JWT token in the request body that contains the elder ID.
 * The token should be in the format "invite-{elderId}".
 * The elder ID is extracted from the token and used to create the relationship.
 * If the token is invalid or the elder ID does not match, an error is returned.
 * If the relationship is created successfully, a success message is returned.
 */
export const createElderRelationshipHandler = authenticated(
  async (req, res) => {
    const caregiverId = res.locals.user.userId;
    const token = atob(decodeURIComponent(z.string().parse(req.body.token)));

    try {
      // Verify the JWT token, extracting the elder ID from it
      const { sub: elderId } = await jwtVerify(token, jwtSecret).then(
        ({ payload }) =>
          z
            .object({
              sub: z
                .string()
                .refine((val) => val.startsWith("invite-"))
                .transform((val) => val.split("-")[1])
                .pipe(z.coerce.number()),
            })
            .parseAsync(payload)
      );

      // Create the relationship between the caregiver and elder
      await addRelationship(caregiverId, elderId);

      res.status(201).json({
        message: "Elder relationship created successfully",
        elderId,
      });
    } catch (error: unknown) {
      console.error("Error creating elder relationship:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid token format" });
      } else if (error instanceof JOSEError) {
        res.status(401).json({ error: "Invalid or expired token" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);
