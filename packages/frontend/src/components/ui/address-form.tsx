import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type Address } from "@carely/core";
import { http } from "@/lib/http";
import { Button } from "./button";
import { Input } from "./input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

interface AddressFormProps {
  defaultValues?: Partial<Address>;
  onSubmit: (data: Address) => void;
  className?: string;
}

export const AddressForm = ({
  defaultValues,
  onSubmit,
  className,
}: AddressFormProps) => {
  const [suggestions, setSuggestions] = useState<
    Array<{ place_id: string; description: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street_address: "",
      unit_number: "",
      postal_code: "",
      ...defaultValues,
    },
  });

  // Debounced search function
  const searchPlaces = useCallback(async (input: string) => {
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
  }, []);

  // Debounce the search
  useEffect(() => {
    const streetAddress = form.watch("street_address");
    const timeoutId = setTimeout(() => {
      searchPlaces(streetAddress || "");
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [form, searchPlaces]);

  const handlePlaceSelect = async (placeId: string) => {
    try {
      setIsLoading(true);
      const response = await http().get("/api/maps/places/details", {
        params: { place_id: placeId },
      });

      const { formatted_address, latitude, longitude } = response.data;

      // Extract postal code from formatted address (simple approach)
      const postalCodeMatch = formatted_address.match(/\b\d{6}\b/);
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : "";

      form.setValue("street_address", formatted_address);
      form.setValue("postal_code", postalCode);
      if (latitude && longitude) {
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
      }

      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Error fetching place details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (data: Address) => {
    onSubmit(data);
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Enter street address"
                    disabled={isLoading}
                  />
                </FormControl>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handlePlaceSelect(suggestion.place_id)}
                      >
                        {suggestion.description}
                      </button>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="e.g., #12-34"
                  />
                </FormControl>
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
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="e.g., 123456"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display coordinates if available */}
          {(form.watch("latitude") || form.watch("longitude")) && (
            <div className="text-sm text-gray-600">
              📍 Coordinates: {form.watch("latitude")?.toFixed(6)},{" "}
              {form.watch("longitude")?.toFixed(6)}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Save Address"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
