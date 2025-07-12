import { elderSchema } from "@carely/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useEffect, useState } from "react";
import type { Address } from "@carely/core";

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

const elderFormSchema = z.object({
  name: elderSchema.shape.name,
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  phone: elderSchema.shape.phone.unwrap().unwrap().optional(),
  address: elderSchema.shape.address,
  address_details: elderSchema.shape.address_details.optional(),
});

export type ElderFormType = z.infer<typeof elderFormSchema>;

export function ElderForm({
  defaultValues = {},
  onSubmit,
}: {
  defaultValues?: Partial<ElderFormType>;
  onSubmit: (values: ElderFormType) => Promise<void>;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const form = useForm<ElderFormType>({
    resolver: zodResolver(elderFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAddressChange = (
    addressDetails: Partial<Address> | undefined | null
  ) => {
    form.setValue("address_details", addressDetails as any);

    // Also update the legacy address field for backward compatibility
    if (addressDetails) {
      const fullAddress = [
        addressDetails.street_address,
        addressDetails.unit_number,
        addressDetails.city,
        addressDetails.state,
        addressDetails.postal_code,
        addressDetails.country,
      ]
        .filter(Boolean)
        .join(", ");

      form.setValue("address", fullAddress);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem
                className={`transition-all duration-700 ease-out ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                <FormLabel className="text-base font-semibold text-gray-900 mb-3 block">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter their full name"
                    className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                    {...field}
                  />
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
              <FormItem
                className={`transition-all duration-700 ease-out ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "120ms" }}
              >
                <FormLabel className="text-base font-semibold text-gray-900 mb-3 block">
                  Date of Birth
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
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
              <FormItem
                className={`transition-all duration-700 ease-out ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "140ms" }}
              >
                <FormLabel className="text-base font-semibold text-gray-900 mb-3 block">
                  Gender
                </FormLabel>
                <FormControl>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`px-6 py-2 rounded-lg border text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                          ${
                            field.value === option.value
                              ? "bg-blue-600 text-white border-blue-600 shadow"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50"
                          }
                        `}
                        aria-pressed={field.value === option.value}
                        onClick={() => field.onChange(option.value)}
                      >
                        {option.label}
                      </button>
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
              <FormItem
                className={`transition-all duration-700 ease-out ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <FormLabel className="text-base font-semibold text-gray-900 mb-3 block">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter their phone number"
                    className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
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
            name="address_details"
            render={({ field }) => (
              <FormItem
                className={`transition-all duration-700 ease-out ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <FormControl>
                  <AddressForm
                    value={field.value}
                    onChange={handleAddressChange}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm mt-2">
                  Enter their address details. You can start typing to get
                  suggestions from Google Maps.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className={`pt-8 border-t border-gray-200/60 transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              !form.formState.isDirty ||
              !form.formState.isValid
            }
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {form.formState.isSubmitting ? (
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Creating Profile...</span>
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
                <span>Create Profile</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
