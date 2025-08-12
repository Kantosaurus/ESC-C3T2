import { useEffect, useRef, useState } from "react";
import { addressSchema, type Address } from "@carely/core";
import { Input } from "./input";
import { Label } from "./label";
import { env } from "@/lib/env";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import { FormField, FormItem, FormLabel, FormMessage } from "./form";
import { mergeRefs } from "@/lib/merge-refs";
import { GoogleMapsDiagnostic } from "./google-maps-diagnostic";
import type { GoogleMapsAutocomplete } from "@/types/google-maps";

interface AddressFormProps {
  className?: string;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<GoogleMapsAutocomplete | null>(null);

  // Load Google Maps API
  useEffect(() => {
    console.log("AddressForm: Starting Google Maps API load...");
    console.log("API Key present:", !!env.GOOGLE_MAPS_API_KEY);
    console.log("API Key length:", env.GOOGLE_MAPS_API_KEY?.length);
    
    if (!env.GOOGLE_MAPS_API_KEY) {
      const errorMsg = "Google Maps API key not found in environment variables";
      console.warn(errorMsg);
      setLoadError(errorMsg);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setIsLoaded(true);
        setLoadError(null);
      });
      existingScript.addEventListener("error", () => {
        const errorMsg =
          "Failed to load Google Maps API - check your API key and network connection";
        console.error(errorMsg);
        setLoadError(errorMsg);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      // Add a small delay to ensure everything is initialized
      setTimeout(() => {
        setIsLoaded(true);
        setLoadError(null);
      }, 100);
    };

    script.onerror = (error) => {
      const errorMsg =
        "Failed to load Google Maps API - check your API key, billing, and API restrictions";
      console.error(errorMsg, error);
      setLoadError(errorMsg);
    };
    
    document.head.appendChild(script);
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) {
      console.error("Google Maps Places API not available");
      setLoadError("Google Maps Places API not available after loading");
      return;
    }

    const input = autocompleteRef.current;

    try {
      console.log("Initializing Google Maps Autocomplete...");
      if (window.google?.maps?.places?.Autocomplete) {
        autocompleteInstance.current = new window.google.maps.places.Autocomplete(
        input,
        {
          types: ["address"],
          fields: ["address_components", "geometry", "formatted_address"],
        }
        );
        console.log("Google Maps Autocomplete initialized successfully");
      }
    } catch (error) {
      console.error("Failed to initialize Google Maps Autocomplete:", error);
      setLoadError(`Failed to initialize autocomplete: ${error}`);
      return;
    }

    if (autocompleteInstance.current) {
      autocompleteInstance.current.addListener("place_changed", () => {
      try {
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
      } catch (error) {
        console.error("Error processing place data:", error);
      }
    });
    }

    return () => {
      if (autocompleteInstance.current && window.google?.maps?.event) {
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
    if (!window.google?.maps?.Map) {
      console.error("Google Maps API not available for map preview");
      return;
    }

    const mapDiv = document.getElementById("address-map-preview");
    if (!mapDiv) return;

    try {
      // Clean up previous map instance
      mapDiv.innerHTML = "";

      // Use the global google.maps types
      if (window.google?.maps?.Map) {
        const map = new window.google.maps.Map(mapDiv, {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
        disableDefaultUI: true,
        gestureHandling: "none",
        });
        if (window.google?.maps?.Marker) {
          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
          });
        }
      }
    } catch (error) {
      console.error("Error creating map preview:", error);
    }
  }, [isLoaded, latitude, longitude]);

  if (!env.GOOGLE_MAPS_API_KEY || loadError) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            Address
          </Label>
          <p className="text-sm text-red-500 mb-4">
            {loadError ||
              "Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables."}
          </p>
          {env.GOOGLE_MAPS_API_KEY && (
            <p className="text-xs text-gray-400 mb-4">
              API Key present: {env.GOOGLE_MAPS_API_KEY.substring(0, 10)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <GoogleMapsDiagnostic />

      <FormField
        control={form.control}
        name="street_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <Input
              placeholder={
                isLoaded
                  ? "Start typing your address..."
                  : "Loading Google Maps..."
              }
              {...field}
              ref={mergeRefs(field.ref, autocompleteRef)}
              disabled={!isLoaded}
            />
            <p className="text-gray-500 text-sm mt-2">
              {isLoaded
                ? "Start typing to see address suggestions from Google Maps"
                : "Loading address autocomplete..."}
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
