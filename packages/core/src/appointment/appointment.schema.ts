import z from "zod/v4";

export const appointmentSchema = z.object({
  elder_id: z.coerce.number(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  details: z.string().nullish(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
