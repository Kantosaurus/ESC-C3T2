import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { z } from "zod/v4";
import { FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { mergeRefs } from "@/lib/merge-refs";
import { http } from "@/lib/http";
import type { Address } from "@carely/core";

const _addressFormSchema = z.object({
  street_address: z.string().optional(),
  unit_number: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

interface AddressFormProps {
  className?: string;
}

export type AddressFormType = z.infer<typeof _addressFormSchema>;
export type AddressFormInput = z.input<typeof _addressFormSchema>;

export function AddressForm({ className }: AddressFormProps) {
  const form = useFormContext<AddressFormInput, unknown, AddressFormType>();

  const [suggestions, setSuggestions] = useState<
    Array<{ description: string; place_id: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchPlaces = async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await http().get("/api/maps/places/autocomplete", {
        params: { input },
      });
      setSuggestions(response.data.predictions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const input = autocompleteRef.current?.value || "";
      searchPlaces(input);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [form.watch("street_address")]);

  // Handle place selection
  const handlePlaceSelect = async (placeId: string) => {
    try {
      const response = await http().get("/api/maps/places/details", {
        params: { place_id: placeId },
      });

      const { address_components, geometry } = response.data;

      const newAddress: Partial<Address> = {
        street_address: `${address_components.street_number || ""} ${
          address_components.route || ""
        }`.trim(),
        postal_code: address_components.postal_code || "",
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
      };

      form.setValue("street_address", newAddress.street_address ?? undefined);
      form.setValue("postal_code", newAddress.postal_code ?? undefined);
      form.setValue("latitude", newAddress.latitude ?? undefined);
      form.setValue("longitude", newAddress.longitude ?? undefined);

      setShowSuggestions(false);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !autocompleteRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // watch latitude and longitude to update address
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  return (
    <div className={className}>
      <FormField
        control={form.control}
        name="street_address"
        render={({ field }) => (
          <FormItem className="relative">
            <FormLabel>Address</FormLabel>
            <Input
              placeholder="Start typing your address..."
              {...field}
              ref={mergeRefs(field.ref, autocompleteRef)}
              onChange={(e) => {
                field.onChange(e);
                setShowSuggestions(true);
              }}
            />
            <p className="text-gray-500 text-sm mt-2">
              Start typing to see address suggestions
            </p>

            {/* Address suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => handlePlaceSelect(suggestion.place_id)}
                  >
                    {suggestion.description}
                  </button>
                ))}
              </div>
            )}
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="unit_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
              <Input placeholder="Apt, Suite, etc. (optional)" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <Input placeholder="Enter postal code" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {latitude && longitude && (
        <div className="rounded-lg border border-blue-200 overflow-hidden bg-blue-50 p-4">
          <p className="text-sm text-gray-600 mb-2">
            📍 Location coordinates: {latitude.toFixed(6)},{" "}
            {longitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-500">
            Address has been geocoded successfully
          </p>
        </div>
      )}
    </div>
  );
}
