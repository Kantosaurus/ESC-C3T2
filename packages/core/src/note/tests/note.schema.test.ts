import { describe, it, expect } from "vitest";
import { noteSchema, Note } from "../note.schema.ts";

describe("noteSchema zod validation unit tests", () => {
    // Valid tests
    it("valid note schema", () => {
        const validNote: Note = {
            id: 0,
            header: "Test Note Header",
            content: "Test note content information",
            caregiver_id: "cg_123_xyz",
            assigned_elder_id: 2,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const result = noteSchema.safeParse(validNote);
        expect(result.success).toBe(true);
    });
    it("valid note schema with coerced string and empty content", () => {
        const validNote: Note = {
            id: "6", // Valid coerced string into number
            header: "Title of test note",
            content: "", // Empty content is valid
            caregiver_id: "cg012345678",
            assigned_elder_id: "12", // Valid coerced string into number
            created_at: new Date(),
            updated_at: new Date(),
        };
        const result = noteSchema.safeParse(validNote);
        expect(result.success).toBe(true);
    });
    // Invalid tests
    it("invalid note schema with invalid id type", () => {
        const invalidNote: Note = {
            id: "12abc", // Invalid id type, should be a number
            header: "Test",
            content: "some content",
            caregiver_id: "cg012345678",
            assigned_elder_id: 10,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const result = noteSchema.safeParse(invalidNote);
        expect(result.success).toBe(false);
    });

    it("invalid note schema with header that exceed maximum characters", ()=>{
        const invalidNote: Note = {
            id: "6", // Valid coerced string into number
            header: "Test header that is way too long, which exceeds the maximum length of 80 characters......      ....... . .. . . . . . . . .. .......",
            content: "some content", 
            caregiver_id: "cg012345678",
            assigned_elder_id: 10,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const result = noteSchema.safeParse(invalidNote);
        expect(result.success).toBe(false);
    });
});