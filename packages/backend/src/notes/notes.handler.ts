import { notesSchema } from "@carely/core";
import { getNotesDetails, insertNotes } from "./notes.entity";
import { authenticated } from "#auth/guard.js";

export const getNotesHandler = authenticated(async (req, res) => {
    const elderId = Number(req.params.elderId);
    const notesDetails = await getNotesDetails(elderId);
    res.json(notesDetails);
});

export const insertNotesHandler = authenticated(async(req, res) => {
    try {
        const notesDetails = notesSchema.parse(req.body);
        const saved = await insertNotes(notesDetails);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: "Failed to create notes", details: err});
    }
});