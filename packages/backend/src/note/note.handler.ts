import { newNoteDtoSchema } from "@carely/core";
import { getNotesDetails, insertNotes } from "./note.entity";
import { authenticated } from "#auth/guard.js";

export const getNotesHandler = authenticated(async (req, res) => {
    const caregiverId = res.locals.user.userId;
    const notesDetails = await getNotesDetails(caregiverId);
    res.json(notesDetails);
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
            updated_at: now
        };
        const saved = await insertNotes(fullNoteDetails);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: "Failed to create notes", details: err });
    }
});