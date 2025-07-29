import {
  newNoteDtoSchema,
  noteSchema,
  xssProtectedNewNoteDtoSchema,
  xssProtectedNoteSchema,
} from "@carely/core";
import {
  getNotesDetails,
  insertNotes,
  updateNotes,
  deleteNotes,
} from "./note.entity";
import { authenticated } from "#auth/guard.js";
import { hasElderAccess, hasNoteAccess } from "../auth/authorization";
import z from "zod";

export const getNotesHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;
  const notesDetails = await getNotesDetails(caregiverId);
  res.json(notesDetails);
});

export const insertNotesHandler = authenticated(async (req, res) => {
  try {
    // Use XSS-protected schema for input validation and sanitization
    const notesPayload = xssProtectedNewNoteDtoSchema.parse(req.body);
    const caregiverId = res.locals.user.userId;

    // Check if user has access to the elder for whom they're creating a note
    if (notesPayload.assigned_elder_id) {
      const hasAccess = await hasElderAccess(
        caregiverId,
        notesPayload.assigned_elder_id
      );
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this elder" });
      }
    }

    // Merge with the rest of the fields
    const now = new Date();
    const fullNoteDetails = {
      ...notesPayload,
      caregiver_id: caregiverId,
      created_at: now,
      updated_at: now,
    };
    const saved = await insertNotes(fullNoteDetails);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Failed to create notes", details: err });
  }
});

export const updateNotesHandler = authenticated(async (req, res) => {
  try {
    const now = new Date();
    const caregiverId = res.locals.user.userId;

    // Use XSS-protected schema for input validation and sanitization
    const fullNoteDetails = xssProtectedNoteSchema
      .pick({ id: true, header: true, content: true, assigned_elder_id: true })
      .parse(req.body);

    // Check if user has access to the note they're trying to update
    const hasAccess = await hasNoteAccess(caregiverId, fullNoteDetails.id);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this note" });
    }

    // If the note is being reassigned to a different elder, check access to that elder
    if (fullNoteDetails.assigned_elder_id) {
      const hasElderAccess = await hasElderAccess(
        caregiverId,
        fullNoteDetails.assigned_elder_id
      );
      if (!hasElderAccess) {
        return res
          .status(403)
          .json({ error: "Access denied to the assigned elder" });
      }
    }

    const saved = await updateNotes({
      ...fullNoteDetails,
      caregiver_id: caregiverId,
      updated_at: now,
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error("update failed", err);
    res.status(400).json({ error: "Failed to update notes", details: err });
  }
});

export const deleteNotesHandler = authenticated(async (req, res) => {
  const { id } = z
    .object({
      id: z.number(),
    })
    .parse(req.body);

  const caregiverId = res.locals.user.userId;

  // Check if user has access to the note they're trying to delete
  const hasAccess = await hasNoteAccess(caregiverId, id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this note" });
  }

  try {
    await deleteNotes(id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("delete failed", err);
    res.status(404).json({ error: "Failed to delete notes", details: err });
  }
});
