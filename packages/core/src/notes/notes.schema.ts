import z from "zod/v4";

export const notesSchema = z.object({
    id: z.string(),
    elder_name: z.string().min(1, "Name is required"),
    header: z
        .string()
        .max(30, "Header must be at most 30 characters long"),
    content: z
        .string()
        .max(5000, "Content must be at most 5000 characters long")
        .nullish(),
    created_at: z.date(),
    updated_at: z.date(),
});

export type Notes = z.infer<typeof notesSchema>;

export const newNotesDtoSchema = notesSchema.pick({
    elder_name: true,
    header: true,
    content: true,
});

export type NewNotesDto = Pick<Notes, "elder_name" | "header" | "content">;
