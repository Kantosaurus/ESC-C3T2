import { z } from "zod";

const datetimeString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid datetime format",
});

export const appointmentSchema = z.object({
  id: z.string(),
  elder_id: z.number(),
  startDateTime: datetimeString,
  endDateTime: datetimeString,
  details: z.string(),
});

export type appointment = z.infer<typeof appointmentSchema>;
