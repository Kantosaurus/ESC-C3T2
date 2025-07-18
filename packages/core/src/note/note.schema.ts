import z from "zod/v4";

export const noteSchema = z.object({
  id: z.coerce.number(),
  header: z.string().max(30, "Header must be at most 30 characters long"),
  content: z
    .string()
    .max(5000, "Content must be at most 5000 characters long")
    .nullish(),
  caregiver_id: z.coerce.string(),
  assigned_elder_id: z.coerce.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Note = z.infer<typeof noteSchema>;

export const newNoteDtoSchema = noteSchema.pick({
  header: true,
  content: true,
  assigned_elder_id: true,
});

export type NewNoteDto = Pick<Note, "header" | "content" | "assigned_elder_id">;
