import { Notes, notesSchema} from "@carely/core";
import z from "zod/v4";
import { db } from "../db/db";

export const getNotesDetails = (elderId: number) =>
    db
        .query(`SELECT * FROM notes WHERE elder_id = $1 ORDER BY created_at ASC`, [elderId])
        .then((result) => z.array(notesSchema).parse(result));

export const insertNotes = (
    notesDetails: Pick<Notes, "id" | "elder_name" | "header" | "content" | "created_at" | "updated_at">
) =>
    db
    .query(
        `INSERT INTO notes (id, elder_name, header, content, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *`,
        [
            notesDetails.id,
            notesDetails.elder_name,
            notesDetails.header,
            notesDetails.content,
            notesDetails.created_at,
            notesDetails.updated_at,
        ]
    )
    .then((result) => z.array(notesSchema).parse(result)[0]);