import { useEffect, useRef, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "./input";
import { FormField, FormItem, FormLabel, FormMessage } from "./form";
import {
  loadGoogleMapsAPI,
  subscribeToLoadState,
  parseGooglePlace,
  type GoogleMapsLoadState,
} from "@/lib/google-maps";
import type {
  GoogleMapsAutocomplete,
  GoogleMapsMap,
  GoogleMapsMarker,
} from "@/types/google-maps";

interface AddressInputProps {
  className?: string;
  streetAddressFieldName?: string;
  unitNumberFieldName?: string;
  postalCodeFieldName?: string;
  latitudeFieldName?: string;
  longitudeFieldName?: string;
}

export function AddressInput({
  className,
  streetAddressFieldName = "street_address",
  unitNumberFieldName = "unit_number",
  postalCodeFieldName = "postal_code",
  latitudeFieldName = "latitude",
  longitudeFieldName = "longitude",
}: AddressInputProps) {
  const form = useFormContext();
  const [loadState, setLoadState] = useState<GoogleMapsLoadState>({
    isLoaded: false,
    isLoading: false,
    error: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GoogleMapsAutocomplete | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapsMap | null>(null);
  const markerRef = useRef<GoogleMapsMarker | null>(null);

  // Subscribe to Google Maps load state
  useEffect(() => {
    const unsubscribe = subscribeToLoadState(setLoadState);

    // Start loading if not already started and API key is available
    if (!loadState.isLoaded && !loadState.isLoading) {
      // Check if API key exists before attempting to load
      if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        loadGoogleMapsAPI().catch(console.error);
      } else {
        // Set error state directly if no API key
        setLoadState({
          isLoaded: false,
          isLoading: false,
          error: "Google Maps API key not configured",
        });
      }
    }

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map when coordinates change
  const updateMap = useCallback((lat: number, lng: number) => {
    if (!mapRef.current || !loadState.isLoaded) return;

    try {
      if (!mapInstanceRef.current && window.google?.maps?.Map) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 16,
          disableDefaultUI: true,
          gestureHandling: "none",
        });
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat, lng });
      }

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      if (window.google?.maps?.Marker) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
        });
      }
    } catch (error) {
      console.error("Error updating map:", error);
    }
  }, [loadState.isLoaded]);

  // Initialize autocomplete when API is loaded
  useEffect(() => {

    // Clean up previous instance if it exists
    if (autocompleteRef.current) {
      window.google?.maps?.event?.clearInstanceListeners(
        autocompleteRef.current
      );
      autocompleteRef.current = null;
    }

    if (!loadState.isLoaded || !inputRef.current) {
      return;
    }

    try {
      console.log(
        "Initializing Google Places Autocomplete on input:",
        inputRef.current
      );

      if (window.google?.maps?.places?.Autocomplete) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          fields: ["address_components", "geometry", "formatted_address"],
        }
      );

      console.log("Setting up place_changed listener");
      autocompleteRef.current.addListener("place_changed", () => {
        console.log("place_changed event fired");
        const place = autocompleteRef.current?.getPlace();
        console.log("Place selected:", place);

        if (!place) return;

        const parsedAddress = parseGooglePlace(place);
        console.log("Parsed address:", parsedAddress);

        // Update form values
        if (parsedAddress.street_address) {
          form.setValue(streetAddressFieldName, parsedAddress.street_address);
        }
        if (parsedAddress.postal_code) {
          form.setValue(postalCodeFieldName, parsedAddress.postal_code);
        }
        if (parsedAddress.latitude !== undefined) {
          form.setValue(latitudeFieldName, parsedAddress.latitude);
        }
        if (parsedAddress.longitude !== undefined) {
          form.setValue(longitudeFieldName, parsedAddress.longitude);
        }

        // Update map if coordinates are available
        if (parsedAddress.latitude && parsedAddress.longitude) {
          updateMap(parsedAddress.latitude, parsedAddress.longitude);
        }
      });

        console.log("Google Places Autocomplete initialized successfully");
      }
    } catch (error) {
      console.error("Failed to initialize Google Places Autocomplete:", error);
    }
  }, [
    loadState.isLoaded,
    form,
    streetAddressFieldName,
    unitNumberFieldName,
    postalCodeFieldName,
    latitudeFieldName,
    longitudeFieldName,
    updateMap,
  ]);

  // Watch for coordinate changes to update map
  const latitude = form.watch(latitudeFieldName);
  const longitude = form.watch(longitudeFieldName);

  useEffect(() => {
    if (latitude && longitude) {
      updateMap(latitude, longitude);
    }
  }, [latitude, longitude, updateMap]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  if (loadState.error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Address Autocomplete Unavailable
          </h3>
          <p className="text-sm text-red-600">{loadState.error}</p>
          <p className="text-xs text-red-500 mt-2">
            You can still enter addresses manually.
          </p>
        </div>
        <ManualAddressFields 
          streetAddressFieldName={streetAddressFieldName}
          unitNumberFieldName={unitNumberFieldName}
          postalCodeFieldName={postalCodeFieldName}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <FormField
        control={form.control}
        name={streetAddressFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <Input
              {...field}
              onFocus={(e) => {
                // Use the event target as our input ref
                inputRef.current = e.target;
                if (!autocompleteRef.current && loadState.isLoaded) {
                  // Initialize Google Places Autocomplete
                  try {
                    console.log(
                      "Initializing Google Places Autocomplete on focus"
                    );
                    if (window.google?.maps?.places?.Autocomplete) {
                      autocompleteRef.current =
                        new window.google.maps.places.Autocomplete(e.target, {
                        types: ["address"],
                        fields: [
                          "address_components",
                          "geometry",
                          "formatted_address",
                        ],
                      });

                    autocompleteRef.current.addListener("place_changed", () => {
                      const place = autocompleteRef.current?.getPlace();
                      console.log("Place selected:", place);

                      if (!place) return;

                      const parsedAddress = parseGooglePlace(place);
                      console.log("Parsed address:", parsedAddress);

                      // Update form values
                      if (parsedAddress.street_address) {
                        form.setValue(
                          streetAddressFieldName,
                          parsedAddress.street_address,
                          { shouldValidate: true }
                        );
                      }
                      if (parsedAddress.postal_code) {
                        form.setValue(
                          postalCodeFieldName,
                          parsedAddress.postal_code,
                          { shouldValidate: true }
                        );
                      }
                      if (parsedAddress.latitude !== undefined) {
                        form.setValue(
                          latitudeFieldName,
                          parsedAddress.latitude,
                          { shouldValidate: true }
                        );
                      }
                      if (parsedAddress.longitude !== undefined) {
                        form.setValue(
                          longitudeFieldName,
                          parsedAddress.longitude,
                          { shouldValidate: true }
                        );
                      }

                      // Update map if coordinates are available
                      if (parsedAddress.latitude && parsedAddress.longitude) {
                        updateMap(
                          parsedAddress.latitude,
                          parsedAddress.longitude
                        );
                      }
                    });
                    }
                  } catch (error) {
                    console.error(
                      "Failed to initialize Google Places Autocomplete:",
                      error
                    );
                  }
                }
              }}
              placeholder={
                loadState.isLoaded
                  ? "Start typing your address..."
                  : loadState.isLoading
                  ? "Loading address autocomplete..."
                  : "Enter your address"
              }
              disabled={loadState.isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              {loadState.isLoaded && "Start typing to see address suggestions"}
              {loadState.isLoading && "Loading Google Maps..."}
              {loadState.error &&
                "Manual entry only - autocomplete unavailable"}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={unitNumberFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
              <Input {...field} placeholder="Apt, Suite, etc. (optional)" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={postalCodeFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <Input {...field} placeholder="Enter postal code" />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Map preview */}
      {latitude && longitude && loadState.isLoaded && (
        <div className="rounded-lg border border-blue-200 overflow-hidden bg-blue-50">
          <div ref={mapRef} style={{ width: "100%", height: 240 }} />
        </div>
      )}
    </div>
  );
}

interface ManualAddressFieldsProps {
  streetAddressFieldName: string;
  unitNumberFieldName: string;
  postalCodeFieldName: string;
}

function ManualAddressFields({
  streetAddressFieldName,
  unitNumberFieldName,
  postalCodeFieldName,
}: ManualAddressFieldsProps) {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={streetAddressFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <Input {...field} placeholder="Enter street address" />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={unitNumberFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
              <Input {...field} placeholder="Apt, Suite, etc. (optional)" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={postalCodeFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <Input {...field} placeholder="Enter postal code" />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
