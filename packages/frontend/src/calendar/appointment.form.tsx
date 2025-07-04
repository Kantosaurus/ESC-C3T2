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
  startDateTime: z.string(),
  endDateTime: z.string(),
  details: appointmentSchema.shape.details.unwrap().unwrap().optional(),
  elder_id: appointmentSchema.shape.elder_id,
});

export type AppointmentFormType = z.infer<typeof appointmentFormSchema>;

export function AppointmentForm({
  defaultValues = { details: "" },
  selectedDate,
  elder_id,
  elder_name,
  onSubmit,
}: {
  defaultValues?: Partial<AppointmentFormType>;
  selectedDate?: Date | null;
  elder_id?: number;
  elder_name?: string;
  onSubmit: (values: AppointmentFormType) => Promise<void>;
}) {
  const form = useForm<AppointmentFormType>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: { ...defaultValues },
  });

  //every 5 mins frrom 6am to 10pm
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = new Date(
          2000,
          0,
          1,
          hour,
          minute
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  //default time values
  const defaultStart = "9:00";
  const defaultEnd = "10:00";

  // create string
  const constructISOString = (date: Date, timeString: string): string => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate.toISOString();
  };

  // get time
  const extractTimeFromISO = (isoString: string): string => {
    if (!isoString) return defaultStart;
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (selectedDate) {
      const startTime = defaultStart;
      const endTime = defaultEnd;

      form.setValue(
        "startDateTime",
        constructISOString(selectedDate, startTime)
      );
      form.setValue("endDateTime", constructISOString(selectedDate, endTime));
    }
  }, [selectedDate, form]);

  useEffect(() => {
    if (elder_id) {
      form.setValue("elder_id", elder_id);
    }
  }, [elder_id, form]);

  const handleTimeChange = (field: string, timeString: string) => {
    if (selectedDate) {
      const isoString = constructISOString(selectedDate, timeString);
      form.setValue(field as keyof AppointmentFormType, isoString);
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Selected:{" "}
                    {selectedDate && field.value
                      ? new Date(field.value).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "No time selected"}
                  </div>
                  <ScrollArea className="h-32 border rounded p-2">
                    <div className="space-y-1">
                      {timeOptions.map((time) => (
                        <div
                          key={time.value}
                          className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            field.value &&
                            extractTimeFromISO(field.value) === time.value
                              ? "bg-blue-100 border-blue-300"
                              : ""
                          }`}
                          onClick={() =>
                            handleTimeChange("startDateTime", time.value)
                          }
                        >
                          {time.display}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </FormControl>
              <FormDescription>
                Select the appointment start time.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Selected:{" "}
                    {selectedDate && field.value
                      ? new Date(field.value).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "No time selected"}
                  </div>
                  <ScrollArea className="h-32 border rounded p-2">
                    <div className="space-y-1">
                      {timeOptions.map((time) => (
                        <div
                          key={time.value}
                          className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                            field.value &&
                            extractTimeFromISO(field.value) === time.value
                              ? "bg-blue-100 border-blue-300"
                              : ""
                          }`}
                          onClick={() =>
                            handleTimeChange("endDateTime", time.value)
                          }
                        >
                          {time.display}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </FormControl>
              <FormDescription>
                Select the appointment end time.
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
                <Input placeholder="Additional details..." {...field} />
              </FormControl>
              <FormDescription>
                Optional details for the appointment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            form.formState.isSubmitting ||
            !form.formState.isDirty ||
            !elder_id ||
            !selectedDate
          }
        >
          {form.formState.isSubmitting ? "Creating..." : "Create Appointment"}
        </Button>
      </form>
    </Form>
  );
}
