import { newNoteDtoSchema, noteSchema } from "@carely/core";
import {
  getNotesDetails,
  insertNotes,
  updateNotes,
  deleteNotes,
  getNoteDetails,
} from "./note.entity";
import { authenticated } from "#auth/guard.js";
import z from "zod";

export const getNotesHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId;
  const notesDetails = await getNotesDetails(caregiverId);
  res.json(notesDetails);
});

export const getSingleNoteHandler = authenticated(async (req, res) => {
  const noteId = Number(req.params.id);
  if (isNaN(noteId)) {
    return res.status(400).send("invalid noteId");
  }
  const note = await getNoteDetails(noteId);
  if (!note) {
    return res.status(404).send("Note not found");
  }
  res.json(note);
});

export const insertNotesHandler = authenticated(async (req, res) => {
  try {
    // Use newNoteDtoSchema to validate only the client-sent fields
    const notesPayload = newNoteDtoSchema.parse(req.body);
    // Merge with the rest of the fields
    const now = new Date();
    const fullNoteDetails = {
      ...notesPayload,
      caregiver_id: res.locals.user.userId,
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

    const fullNoteDetails = noteSchema
      .pick({ id: true, header: true, content: true, assigned_elder_id: true })
      .parse(req.body);

    const saved = await updateNotes({
      ...fullNoteDetails,
      caregiver_id: res.locals.user.userId,
      updated_at: now,
    });
    res.status(200).json(saved);
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
  try {
    await deleteNotes(id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("delete failed", err);
    res.status(404).json({ error: "Failed to delete notes", details: err });
  }
});
