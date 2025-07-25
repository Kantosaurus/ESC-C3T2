import { describe, test, expect, vi, beforeEach } from "vitest";
import { getNotesDetails } from "../note.entity";
import { db } from "../../db/db";

// Unit tests: check methods logic
describe("note.entity unit tests", () => {
    const mockQuery = vi.mocked(db.query);

    // Mock the database for unit tests
    vi.mock("../../db/db", () => ({
        db: {
            query: vi.fn()
        }
    }));

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("return a unresolved Promise", () => {
        const mockDbResult = [
            {
                id: 1,
                header: "Test Note",
                content: "Test content",
                caregiver_id: "cg_123_xyz",
                assigned_elder_id: 1,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];
        mockQuery.mockResolvedValue(mockDbResult);

        const caregiverId = "cg_123_xyz";
        const result = getNotesDetails(caregiverId);

        expect(result).toBeInstanceOf(Promise);
    });

    test("return an array of notes from resolved Promise", async () => {
        const mockDbResult = [
            {
                id: 12,
                header: "Test Note",
                content: "Test content",
                caregiver_id: "cg_123_xyz",
                assigned_elder_id: 1,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];
        mockQuery.mockResolvedValue(mockDbResult);
        const caregiverId = "cg_123_xyz";
        const result = await getNotesDetails(caregiverId);

        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toMatchObject({
            id: 12,
            header: "Test Note",
            content: "Test content",
            caregiver_id: "cg_123_xyz",
            assigned_elder_id: 1
        });
    });

    test("handle database errors", async () => {
        // Mock a database error
        const dbError = new Error("Database connection failed");
        // Mock the db.query to throw an error
        mockQuery.mockRejectedValue(dbError);

        const caregiverId = "cg_123_xyz";
        await expect(getNotesDetails(caregiverId)).rejects.toThrow("Database connection failed");
    });
});


