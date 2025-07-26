import { appointmentSchema } from "@carely/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { useEffect } from "react";
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// get time components from ISO string
const extractTimeComponents = (isoString: string) => {
  if (!isoString)
    return { hour: defaultStartHr, minute: defaultMin, ampm: "AM" };
  const date = new Date(isoString);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return {
    hour: displayHour.toString().padStart(2, "0"),
    minute: minute.toString().padStart(2, "0"),
    ampm,
  };
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
    field: "startDateTime" | "endDateTime",
    hour?: string,
    minute?: string,
    ampm?: string
  ) => {
    if (selectedDate) {
      const existing = form.getValues(field) as string | undefined;
      const current = extractTimeComponents(existing ?? "");

      const newHour = hour ?? current.hour;
      const newMinute = minute ?? current.minute;
      const newAmpm = ampm ?? current.ampm;

      let actualHour = Number(newHour);
      if (newAmpm === "PM" && actualHour < 12) {
        actualHour += 12;
      } else if (newAmpm === "AM" && actualHour >= 12) {
        actualHour -= 12;
      }

      const updatedISO = constructISOString(
        selectedDate,
        actualHour.toString(),
        newMinute
      );
      form.setValue(field, updatedISO);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          {defaultValues ? "Edit Appointment" : "New Appointment"}
        </h2>
        <p className="text-slate-600">
          Schedule an appointment for {elder_name}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Elder and Date Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Elder
              </Label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                {elder_name || "No elder selected"}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No date selected"}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => {
                  const timeComponents = extractTimeComponents(
                    field.value as string
                  );

                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Start Time
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Select
                            value={timeComponents.hour}
                            onValueChange={(value) =>
                              handleTimeChange("startDateTime", value)
                            }
                          >
                            <SelectTrigger className="flex-1 border-slate-200">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((hr) => (
                                <SelectItem key={hr.value} value={hr.value}>
                                  {hr.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className="flex items-center text-slate-400 font-medium">
                            :
                          </span>

                          <Select
                            value={timeComponents.minute}
                            onValueChange={(value) =>
                              handleTimeChange(
                                "startDateTime",
                                undefined,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="flex-1 border-slate-200">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {minuteOptions.map((min) => (
                                <SelectItem key={min.value} value={min.value}>
                                  {min.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={timeComponents.ampm}
                            onValueChange={(value) =>
                              handleTimeChange(
                                "startDateTime",
                                undefined,
                                undefined,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-20 border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endDateTime"
                render={({ field }) => {
                  const timeComponents = extractTimeComponents(
                    field.value as string
                  );

                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        End Time
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Select
                            value={timeComponents.hour}
                            onValueChange={(value) =>
                              handleTimeChange("endDateTime", value)
                            }
                          >
                            <SelectTrigger className="flex-1 border-slate-200">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((hr) => (
                                <SelectItem key={hr.value} value={hr.value}>
                                  {hr.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className="flex items-center text-slate-400 font-medium">
                            :
                          </span>

                          <Select
                            value={timeComponents.minute}
                            onValueChange={(value) =>
                              handleTimeChange("endDateTime", undefined, value)
                            }
                          >
                            <SelectTrigger className="flex-1 border-slate-200">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {minuteOptions.map((min) => (
                                <SelectItem key={min.value} value={min.value}>
                                  {min.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={timeComponents.ampm}
                            onValueChange={(value) =>
                              handleTimeChange(
                                "endDateTime",
                                undefined,
                                undefined,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-20 border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Details
            </h3>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Doctor Visit, Therapy Session"
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      A short name for this appointment
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
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Additional notes or details..."
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Optional details about the appointment
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
                    <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Address or location"
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Where the appointment will take place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              disabled={
                form.formState.isSubmitting || !elder_id || !selectedDate
              }
            >
              {form.formState.isSubmitting
                ? defaultValues
                  ? "Saving..."
                  : "Creating..."
                : defaultValues
                ? "Save Changes"
                : "Create Appointment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
