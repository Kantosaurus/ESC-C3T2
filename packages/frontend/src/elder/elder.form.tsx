import { elderSchema } from "@carely/core";
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
import { Textarea } from "@/components/ui/textarea";
import { AddressInput } from "@/components/ui/address-input";
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload";
import { Loader } from "lucide-react";

const elderFormSchema = z.object({
  name: elderSchema.shape.name
    .max(100, "Name must be at most 100 characters")
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      "Name can only contain letters, spaces, periods, apostrophes, and hyphens"
    ),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 50 && actualAge <= 120;
    }, "Age must be between 50 and 120 years"),
  gender: elderSchema.shape.gender,
  phone: z
    .string()
    .optional()
    .transform((x) => {
      if (!x || x.trim() === "") return undefined;
      return x.replace(/\s+/g, "").replace(/^\+65/, "");
    })
    .pipe(
      z
        .string()
        .regex(
          /^[689]\d{7}$/,
          "Phone number must be 8 digits starting with 6, 8, or 9"
        )
        .optional()
    ),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  profile_picture: z.string().nullish(),
  street_address: z
    .string()
    .transform((x) => {
      if (!x || x.trim() === "") return "";
      return x;
    })
    .pipe(
      z
        .string()
        .min(1, "Street address is required")
        .max(255, "Street address must be at most 255 characters")
    ),
  unit_number: z
    .string()
    .optional()
    .transform((x) => {
      if (!x || x.trim() === "") return undefined;
      return x;
    })
    .pipe(
      z
        .string()
        .max(20, "Unit number must be at most 20 characters")
        .regex(
          /^#?\d{2}-\d{2,4}$|^[A-Za-z0-9\-#\s]+$/,
          "Please enter a valid unit number (e.g., #12-345 or Block 123)"
        )
        .optional()
    ),
  postal_code: z
    .string()
    .transform((x) => {
      if (!x || x.trim() === "") return "";
      return x;
    })
    .pipe(
      z
        .string()
        .regex(/^[0-9]{6}$/, "Postal code must be exactly 6 digits")
        .refine((code) => {
          const num = parseInt(code);
          return num >= 10000 && num <= 999999;
        }, "Please enter a valid Singapore postal code")
    ),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ElderFormType = z.infer<typeof elderFormSchema>;
export type ElderFormInput = z.input<typeof elderFormSchema>;

export function ElderForm({
  defaultValues = {},
  onSubmit,
  submitLabel = "Create Profile",
}: {
  defaultValues?: Partial<ElderFormType>;
  onSubmit: (values: ElderFormType) => Promise<void>;
  submitLabel?: string;
}) {
  const form = useForm<ElderFormInput, unknown, ElderFormType>({
    resolver: zodResolver(elderFormSchema),
    defaultValues,
    mode: "onChange",
    criteriaMode: "all",
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
                  <Input placeholder="Enter their full name" {...field} />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  This is the name that will be displayed in the app. You may
                  use their preferred name or nickname.
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
                    data-testid="elder-dob-input"
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
                  <Input
                    placeholder="e.g., 91234567 or +65 9123 4567"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  Optional. We will use this to contact them only in case of
                  emergencies.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about them"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  Optional. Share a brief description about them.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profile_picture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  <ProfilePictureUpload
                    value={field.value || null}
                    onChange={(value) => {
                      field.onChange(value);
                      form.trigger(); // Force form validation and dirty state update
                    }}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  Optional. Upload a profile picture to personalize their
                  account. Supported formats: PNG, JPG. Max size: 10MB (will be
                  compressed automatically).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <AddressInput
            streetAddressFieldName="street_address"
            unitNumberFieldName="unit_number"
            postalCodeFieldName="postal_code"
            latitudeFieldName="latitude"
            longitudeFieldName="longitude"
          />
        </div>

        <div
          className={`pt-8 transition-all duration-700`}
          style={{ transitionDelay: "400ms" }}
        >
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
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
