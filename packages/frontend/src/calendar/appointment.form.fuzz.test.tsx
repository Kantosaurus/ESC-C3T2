import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import z from "zod/v4";

import { appointmentSchema } from "@carely/core";

const appointmentFormSchema = z.object({
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  details: z.string().nullish(),
  elder_id: appointmentSchema.shape.elder_id,
  name: z.string().nonempty("Appointment must have a name"),
  loc: z.string().nullish(),
  appt_id: z.number().optional(),
});

type AppointmentFormInput = z.input<typeof appointmentFormSchema>;

type ElderIdInput = z.input<typeof appointmentSchema.shape.elder_id>;
const elderIdArb: fc.Arbitrary<ElderIdInput> = fc.integer({
  min: 1,
  max: 1_000_000,
});

const isoDateArb = fc
  .date({ min: new Date(2000, 0, 1), max: new Date(2100, 0, 1) })
  .map((d) => d.toISOString());

const nullishStringArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.string({ maxLength: 100 })
);

const validInputArb = fc.record({
  startDateTime: isoDateArb,
  endDateTime: isoDateArb,
  details: nullishStringArb,
  elder_id: elderIdArb,
  name: fc
    .string({ minLength: 1, maxLength: 80 })
    .filter((s) => s.trim().length > 0),
  loc: nullishStringArb,
  appt_id: fc
    .option(fc.integer({ min: 1, max: 1_000_000 }), { nil: undefined })
    .map((v) => v ?? undefined),
}) satisfies fc.Arbitrary<AppointmentFormInput>;

describe("appointmentFormSchema property tests", () => {
  it("accepts any generated valid input", () => {
    fc.assert(
      fc.property(validInputArb, (input) => {
        const parsed = appointmentFormSchema.safeParse(input);
        if (!parsed.success) {
          throw new Error(JSON.stringify(parsed.error.issues, null, 2));
        }
        expect(parsed.data.startDateTime).toBeInstanceOf(Date);
        expect(parsed.data.endDateTime).toBeInstanceOf(Date);
      }),
      { numRuns: 75 }
    );
  });

  it("rejects empty name with the intended message", () => {
    const invalidNameInputArb = validInputArb.map((input) => ({
      ...input,
      name: "" as const,
    }));

    fc.assert(
      fc.property(invalidNameInputArb, (input) => {
        const parsed = appointmentFormSchema.safeParse(input);
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
          expect(
            parsed.error.issues.some(
              (i) => i.message === "Appointment must have a name"
            )
          ).toBe(true);
        }
      }),
      { numRuns: 30 }
    );
  });
});
