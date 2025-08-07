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
import { db } from "#db/db.js";

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
    //const userId = res.locals.user.userId;

    const fullNoteDetails = noteSchema
      .pick({
        id: true,
        header: true,
        content: true,
        assigned_elder_id: true,
        locked_by: true,
      })
      .parse(req.body);

    // Check if the note is locked by the current user
    const note = await getNoteDetails(fullNoteDetails.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }

    if (note.locked_by !== null) {
      return res.status(423).json({
        error: "Note is locked",
        message:
          "Someone is using the note, please wait until they finish editing.",
      });
    }

    const saved = await updateNotes({
      ...fullNoteDetails,
      caregiver_id: res.locals.user.userId,
      updated_at: now,
      locked_by: fullNoteDetails.locked_by ?? null, // Ensure locked_by is set
    });

    // Unlock the note after successful update
    await db.query(`UPDATE notes SET locked_by = NULL WHERE id = $1`, [
      fullNoteDetails.id,
    ]);

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
  const noteId = Number(req.params.id);
  const userId = res.locals.user.userId;
  const note = await getNoteDetails(noteId);
  if (note.locked_by !== null && note.locked_by !== userId) {
    //
    return res.status(423).json({
      error: "Note is locked, Cannot delete",
      message: "Please wait, another caregiver is editing this note.",
    });
  }
  try {
    await deleteNotes(id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("delete failed", err);
    res.status(404).json({ error: "Failed to delete notes", details: err });
  }
});

// Add to your note.handler.ts
export const getLockStatusHandler = authenticated(async (req, res) => {
  const noteId = Number(req.params.id);
  const note = await getNoteDetails(noteId);
  if (!note) {
    return res.status(404).send("Note not found");
  }
  res.json({ locked_by: note.locked_by });
});

export const lockNoteHandler = authenticated(async (req, res) => {
  const noteId = Number(req.params.id);
  if (isNaN(noteId)) {
    return res.status(400).send("invalid noteId");
  }

  const userId = res.locals.user.userId;

  try {
    // First check if the note is already locked by someone else
    const note = await getNoteDetails(noteId);
    if (!note) {
      return res.status(404).send("Note not found");
    }

    if (note.locked_by !== null && note.locked_by !== userId) {
      //
      return res.status(423).json({
        error: "Note is locked",
        message: "Please wait, another caregiver is editing this note",
      });
    }

    // If not locked or locked by current user, proceed to lock it
    await db.query(`UPDATE notes SET locked_by = $1 WHERE id = $2`, [
      userId,
      noteId,
    ]);
    return res.status(200).json({
      success: true,
      message: "Note locked successfully",
    });
  } catch (err) {
    console.error("lock note failed", err);
    res.status(500).json({
      error: "Failed to lock note",
      details: err,
    });
  }
});

export const unlockNoteHandler = authenticated(async (req, res) => {
  const noteId = Number(req.params.id);
  if (isNaN(noteId)) {
    return res.status(400).send("invalid noteId");
  }

  const userId = res.locals.user.userId;

  try {
    // First check if the note is locked by current user
    const note = await getNoteDetails(noteId);
    if (!note) {
      return res.status(404).send("Note not found");
    }

    if (note.locked_by && note.locked_by !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "You cannot unlock a note locked by another caregiver",
      });
    }

    // Unlock the note
    await db.query(`UPDATE notes SET locked_by = NULL WHERE id = $1`, [noteId]);

    res
      .status(200)
      .json({ success: true, message: "Note unlocked successfully" });
  } catch (err) {
    console.error("unlock note failed", err);
    res.status(500).json({ error: "Failed to unlock note", details: err });
  }
});
