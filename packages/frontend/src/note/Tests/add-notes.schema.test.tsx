import { describe, it, expect } from "vitest";
import { addNoteFormSchema } from "../add-note.form"; // ensure it's exported

describe("addNoteFormSchema", () => {
  it("should pass when all required fields are present", () => {
    const result = addNoteFormSchema.safeParse({
      header: "My Note",
      content: "This is a note",
      assigned_elder_id: 123,
    });
    expect(result.success).toBe(true);
  });

  it("should fail when header is missing", () => {
    const result = addNoteFormSchema.safeParse({
      content: "This is a note",
      assigned_elder_id: 123,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when assigned_elder_id is missing", () => {
    const result = addNoteFormSchema.safeParse({
      header: "My Note",
      content: "This is a note",
    });
    expect(result.success).toBe(false);
  });

  it("should pass when content is optional and missing", () => {
    const result = addNoteFormSchema.safeParse({
      header: "My Note",
      assigned_elder_id: 123,
    });
    expect(result.success).toBe(true);
  });
});
