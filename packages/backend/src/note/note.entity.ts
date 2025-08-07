import { Note, noteSchema } from "@carely/core";
import z from "zod/v4";
import { db } from "../db/db";

// Extend the noteSchema with elder name by joining with the elders table
export const getNotesDetails = (caregiverId: string) =>
  db
    .query(
      `SELECT n.*, e.name AS elder_name FROM notes n
            JOIN caregiver_elder ce ON n.assigned_elder_id = ce.elder_id
            JOIN elders e ON ce.elder_id = e.id
            WHERE ce.caregiver_id = $1
            ORDER BY n.updated_at DESC`,
      [caregiverId]
    )
    .then((result) =>
      z
        .array(
          noteSchema.extend({
            elder_name: z.string(),
          })
        )
        .parse(result)
    );

export const getNoteDetails = (noteId: number) =>
  db
    .query(`SELECT * FROM notes WHERE id = $1`, [noteId])
    .then((result) => z.array(noteSchema).parse(result)[0]);

export const insertNotes = (
  noteDetails: Pick<
    Note,
    | "header"
    | "content"
    | "caregiver_id"
    | "assigned_elder_id"
    | "created_at"
    | "updated_at"
  >
) =>
  db
    .query(
      `INSERT INTO notes (header, content, caregiver_id, assigned_elder_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
      [
        noteDetails.header,
        noteDetails.content,
        noteDetails.caregiver_id,
        noteDetails.assigned_elder_id,
        noteDetails.created_at,
        noteDetails.updated_at,
      ]
    )
    .then((result) => z.array(noteSchema).parse(result)[0]);

export const updateNotes = (
  noteDetails: Pick<
    Note,
    "id" | "header" | "content" | "caregiver_id" | "updated_at" | "locked_by"
  >
) =>
  db
    .query(
      `UPDATE notes SET
                header = $2,
                content = $3,
                caregiver_id = $4,
                updated_at = $5
            WHERE id = $1
            RETURNING *`,
      [
        noteDetails.id,
        noteDetails.header,
        noteDetails.content,
        noteDetails.caregiver_id,
        noteDetails.updated_at,
        noteDetails.locked_by,
      ]
    )
    .then((result) => z.array(noteSchema).parse(result)[0]);

export const deleteNotes = (id: number) =>
  db.query(`DELETE FROM notes WHERE id = $1 `, [id]).then((result) => {
    console.log("Notes deleted:", result);
    if (result.rowCount == 0) {
      throw new Error("Row of note not found or already deleted");
    }
  });
