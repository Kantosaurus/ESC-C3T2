import { useEffect, useRef, useState } from "react";
import { addressSchema, type Address } from "@carely/core";
import { Input } from "./input";
import { Label } from "./label";
import { env } from "@/lib/env";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import { FormField, FormItem, FormLabel, FormMessage } from "./form";
import { mergeRefs } from "@/lib/merge-refs";

interface AddressFormProps {
  className?: string;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: { types: string[]; fields: string[] }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              address_components?: Array<{
                types: string[];
                long_name: string;
                short_name: string;
              }>;
            };
          };
        };
        event: {
          clearInstanceListeners: (instance: unknown) => void;
        };
        Map: new (
          mapDiv: HTMLElement,
          options: {
            center: { lat: number; lng: number };
            zoom: number;
            disableDefaultUI?: boolean;
            gestureHandling?: string;
          }
        ) => object;
        Marker: new (options: {
          position: { lat: number; lng: number };
          map: object;
        }) => object;
      };
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _addressFormSchema = z.object({
  street_address: addressSchema.shape.street_address
    .unwrap()
    .unwrap()
    .optional(),
  unit_number: addressSchema.shape.unit_number.unwrap().unwrap().optional(),
  postal_code: addressSchema.shape.postal_code.unwrap().unwrap().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type AddressFormType = z.infer<typeof _addressFormSchema>;
export type AddressFormInput = z.input<typeof _addressFormSchema>;

export function AddressForm({ className }: AddressFormProps) {
  const form = useFormContext<AddressFormInput, unknown, AddressFormType>();

  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<InstanceType<
    Window["google"]["maps"]["places"]["Autocomplete"]
  > | null>(null);

  // Load Google Maps API
  useEffect(() => {
    if (!env.GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not found");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current) return;

    const input = autocompleteRef.current;

    autocompleteInstance.current = new window.google.maps.places.Autocomplete(
      input,
      {
        types: ["address"],
        fields: ["address_components", "geometry", "formatted_address"],
      }
    );

    autocompleteInstance.current.addListener("place_changed", () => {
      const place = autocompleteInstance.current?.getPlace();

      if (!place?.geometry) {
        console.warn("No geometry found for selected place");
        return;
      }

      // Parse address components
      const addressComponents: Record<string, string> = {};

      place.address_components?.forEach(
        (component: {
          types: string[];
          long_name: string;
          short_name: string;
        }) => {
          const type = component.types[0];
          addressComponents[type] = component.long_name;
          addressComponents[`${type}_short`] = component.short_name;
        }
      );

      const newAddress: Partial<Address> = {
        street_address: `${addressComponents.street_number || ""} ${
          addressComponents.route || ""
        }`.trim(),
        postal_code: addressComponents.postal_code || "",
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      form.setValue("street_address", newAddress.street_address ?? undefined);
      form.setValue("postal_code", newAddress.postal_code ?? undefined);
      form.setValue("latitude", newAddress.latitude ?? undefined);
      form.setValue("longitude", newAddress.longitude ?? undefined);
    });

    return () => {
      if (autocompleteInstance.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteInstance.current
        );
      }
    };
  }, [form, isLoaded]);

  // watch latitude and longitude to update address
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  // Google Map Preview Effect
  useEffect(() => {
    if (!isLoaded) return;
    if (!latitude || !longitude) return;
    const mapDiv = document.getElementById("address-map-preview");
    if (!mapDiv) return;

    // Clean up previous map instance
    mapDiv.innerHTML = "";

    // Use the global google.maps types
    const map = new window.google.maps.Map(mapDiv, {
      center: { lat: latitude, lng: longitude },
      zoom: 16,
      disableDefaultUI: true,
      gestureHandling: "none",
    });
    new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map,
    });
  }, [isLoaded, latitude, longitude]);

  if (!env.GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            Address
          </Label>
          <p className="text-sm text-gray-500 mb-4">
            Google Maps API key not configured. Please add
            VITE_GOOGLE_MAPS_API_KEY to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FormField
        control={form.control}
        name="street_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <Input
              placeholder="Start typing your address..."
              {...field}
              ref={mergeRefs(field.ref, autocompleteRef)}
            />
            <p className="text-gray-500 text-sm mt-2">
              Start typing to see address suggestions from Google Maps
            </p>
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
        <div className="rounded-lg border border-blue-200 overflow-hidden bg-blue-50">
          <div
            id="address-map-preview"
            style={{ width: "100%", height: 240 }}
          />
        </div>
      )}
    </>
  );
}
