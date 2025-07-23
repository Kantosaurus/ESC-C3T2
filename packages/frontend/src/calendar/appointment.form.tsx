import { appointmentSchema } from "@carely/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

const appointmentFormSchema = z.object({
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  details: z.string().nullish(),
  elder_id: appointmentSchema.shape.elder_id,
  name: z.string().nonempty("Appointment must have a name"),
  loc: z.string().nullish(),
  appt_id: z.number().optional(),
});

export type AppointmentFormType = z.infer<typeof appointmentFormSchema>;
export type AppointmentFormInput = z.input<typeof appointmentFormSchema>;

const generateHourOptions = () => {
  const hrs = [];
  for (let hour = 1; hour < 13; hour++) {
    const hrString = `${hour.toString().padStart(2, "0")}`;

    hrs.push({ value: hrString, display: hrString });
  }

  return hrs;
};

const generateMinuteOptions = () => {
  const mins = [];
  for (let minute = 0; minute < 60; minute += 5) {
    const minString = `${minute.toString().padStart(2, "0")}`;
    mins.push({ value: minString, display: minString });
  }
  return mins;
};

const minuteOptions = generateMinuteOptions();
const hourOptions = generateHourOptions();

//default time values
const defaultMin = "00";
const defaultStartHr = "9";
const defaultEndHr = "10";

// create string
const constructISOString = (
  date: Date,
  hours: string,
  minutes: string
): string => {
  const newDate = new Date(date);
  newDate.setHours(Number(hours), Number(minutes), 0, 0);
  return newDate.toISOString();
};

// get time
const extractTimeFromISO = (isoString: string): string => {
  if (!isoString) return defaultStartHr + ":" + defaultMin;
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export function AppointmentForm({
  defaultValues,
  selectedDate,
  elder_id,
  elder_name,
  onSubmit,
}: {
  defaultValues?: AppointmentFormType;
  selectedDate?: Date | null;
  elder_id?: number;
  elder_name?: string;
  onSubmit: (values: AppointmentFormType) => Promise<void>;
}) {
  const form = useForm<AppointmentFormInput, unknown, AppointmentFormType>({
    defaultValues: {
      name: "",
      ...defaultValues,
    },
    resolver: zodResolver(appointmentFormSchema),
  });

  useEffect(() => {
    if (!defaultValues && selectedDate) {
      form.setValue(
        "startDateTime",
        constructISOString(selectedDate, defaultStartHr, defaultMin)
      );
      form.setValue(
        "endDateTime",
        constructISOString(selectedDate, defaultEndHr, defaultMin)
      );
    }
  }, [selectedDate, defaultValues, form]);

  useEffect(() => {
    if (elder_id) {
      form.setValue("elder_id", elder_id);
    }
  }, [elder_id, form]);

  const handleTimeChange = (
    field: string,
    hour: string | null,
    minute: string | null,
    ampm: string | null
  ) => {
    if (selectedDate) {
      const existing = form.getValues(
        field as "startDateTime" | "endDateTime"
      ) as string | undefined;
      const date = new Date(existing ?? selectedDate);
      const actualAmpm = ampm ?? (date.getHours() >= 12 ? "PM" : "AM");
      let newHour = hour !== null ? Number(hour) : date.getHours();

      if (actualAmpm == "PM" && newHour < 12) {
        newHour += 12;
      } else if (actualAmpm == "AM" && newHour >= 12) {
        newHour -= 12;
      }

      const newMinute = minute !== null ? Number(minute) : date.getMinutes();
      const updatedISO = constructISOString(
        selectedDate,
        newHour.toString(),
        newMinute.toString()
      );
      form.setValue(field as keyof AppointmentFormType, updatedISO);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-4 p-4 border rounded bg-white shadow space-y-4"
      >
        <div className="space-y-2">
          <Label>Elder</Label>
          <div className="p-2 border rounded bg-gray-50">
            {elder_name || "No elder selected"}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Appointment Date</Label>
          <div className="p-2 border rounded bg-gray-50">
            {selectedDate
              ? selectedDate.toLocaleDateString()
              : "No date selected"}
          </div>
        </div>

        <FormField
          control={form.control}
          name="startDateTime"
          render={({ field }) => {
            const asDate = z.coerce.date().optional().parse(field.value);
            return (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Selected:{" "}
                      {asDate?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }) ?? "No time selected"}
                    </div>
                    <div className="flex space-x-2">
                      <ScrollArea className="h-32 w-2/5 border rounded p-2">
                        <div className="space-y-1">
                          {hourOptions.map((hr) => (
                            <div
                              key={hr.value}
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                extractTimeFromISO(field.value as string) ===
                                hr.value
                                  ? "bg-blue-100 border-blue-300"
                                  : ""
                              }`}
                              onClick={() =>
                                handleTimeChange(
                                  "startDateTime",
                                  hr.value,
                                  null,
                                  null
                                )
                              }
                            >
                              {hr.display}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="h-32 w-2/5 border rounded p-2">
                        <div className="space-y-1">
                          {minuteOptions.map((min) => (
                            <div
                              key={min.value}
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                extractTimeFromISO(field.value as string) ===
                                min.value
                                  ? "bg-blue-100 border-blue-300"
                                  : ""
                              }`}
                              onClick={() =>
                                handleTimeChange(
                                  "startDateTime",
                                  null,
                                  min.value,
                                  null
                                )
                              }
                            >
                              {min.display}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="h-32 w-1/5 border rounded p-2">
                        <div className="space-y-1">
                          {["AM", "PM"].map((ampm) => (
                            <div
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100`}
                              onClick={() =>
                                handleTimeChange(
                                  "startDateTime",
                                  null,
                                  null,
                                  ampm
                                )
                              }
                            >
                              {ampm}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Select the appointment start time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="endDateTime"
          render={({ field }) => {
            const asDate = z.coerce.date().optional().parse(field.value);
            return (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Selected:{" "}
                      {asDate?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }) ?? "No time selected"}
                    </div>
                    <div className="flex space-x-2">
                      <ScrollArea className="h-32 w-2/5 border rounded p-2">
                        <div className="space-y-1">
                          {hourOptions.map((hr) => (
                            <div
                              key={hr.value}
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                extractTimeFromISO(field.value as string) ===
                                hr.value
                                  ? "bg-blue-100 border-blue-300"
                                  : ""
                              }`}
                              onClick={() =>
                                handleTimeChange(
                                  "endDateTime",
                                  hr.value,
                                  null,
                                  null
                                )
                              }
                            >
                              {hr.display}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="h-32 w-2/5 border rounded p-2">
                        <div className="space-y-1">
                          {minuteOptions.map((min) => (
                            <div
                              key={min.value}
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                extractTimeFromISO(field.value as string) ===
                                min.value
                                  ? "bg-blue-100 border-blue-300"
                                  : ""
                              }`}
                              onClick={() =>
                                handleTimeChange(
                                  "endDateTime",
                                  null,
                                  min.value,
                                  null
                                )
                              }
                            >
                              {min.display}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="h-32 w-1/5 border rounded p-2">
                        <div className="space-y-1">
                          {["AM", "PM"].map((ampm) => (
                            <div
                              className={`p-2 rounded cursor-pointer hover:bg-gray-100`}
                              onClick={() =>
                                handleTimeChange(
                                  "endDateTime",
                                  null,
                                  null,
                                  ampm
                                )
                              }
                            >
                              {ampm}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Select the appointment end time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Appointment title (e.g. Doctor Visit)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Short name or label for this appointment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Input
                  placeholder="Additional details..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Optional details for the appointment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Address"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Optional location for the appointment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="outline"
          disabled={form.formState.isSubmitting || !elder_id || !selectedDate}
        >
          {form.formState.isSubmitting
            ? defaultValues
              ? "Saving..."
              : "Creating..."
            : defaultValues
            ? "Save Changes"
            : "Create Appointment"}
        </Button>
      </form>
    </Form>
  );
}
