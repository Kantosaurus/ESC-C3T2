import z from "zod/v4";

export const appointmentSchema = z.object({
  appt_id: z.coerce.number().optional(),
  elder_id: z.coerce.number(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  details: z.string().nullish(),
  name: z.string(),
  loc: z.string().nullish(),
  accepted: z.string().nullish(),
  created_by: z.string(),
  declined: z.array(z.string()).nullish(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
