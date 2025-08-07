import { caregiverSchema } from "@carely/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

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
import { AddressForm } from "@/components/ui/address-form";
import { Loader } from "lucide-react";

const caregiverFormSchema = z.object({
  name: caregiverSchema.shape.name,
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  phone: z
    .string()
    .refine(
      (val) => !val || /^[986]\d{7}$/.test(val),
      "Phone number must be exactly 8 digits and start with 9, 8, or 6"
    )
    .optional(),
  street_address: caregiverSchema.shape.street_address
    .unwrap()
    .unwrap()
    .optional(),
  unit_number: caregiverSchema.shape.unit_number.unwrap().unwrap().optional(),
  postal_code: caregiverSchema.shape.postal_code.unwrap().unwrap().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CaregiverFormType = z.infer<typeof caregiverFormSchema>;

export function CaregiverForm({
  defaultValues = {},
  onSubmit,
  submitLabel = "Create Profile",
}: {
  defaultValues?: Partial<CaregiverFormType>;
  onSubmit: (values: CaregiverFormType) => Promise<void>;
  submitLabel?: string;
}) {
  const form = useForm<CaregiverFormType>({
    resolver: zodResolver(caregiverFormSchema),
    defaultValues,
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  This is the name that will be displayed in the app. You may
                  use your preferred name or nickname.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    data-testid="dob-input"
                    type="date"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={
                          field.value === option.value ? "default" : "outline"
                        }
                        aria-pressed={field.value === option.value}
                        onClick={() => field.onChange(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  Optional. We will use this to contact you only in case of
                  emergencies.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <AddressForm />
        </div>

        <div
          className={`pt-8 border-t border-gray-200/60 transition-all duration-700`}
          style={{ transitionDelay: "400ms" }}
        >
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              !form.formState.isDirty ||
              !form.formState.isValid
            }
            className="w-full h-14 text-base font-semibold rounded-xl"
          >
            {form.formState.isSubmitting ? (
              <div className="flex items-center gap-3">
                <Loader className="animate-spin h-5 w-5" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <span>{submitLabel}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
