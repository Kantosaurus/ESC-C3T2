import { useEffect, useRef, useState } from "react";
import type { Address } from "@carely/core";
import { Input } from "./input";
import { Label } from "./label";
import { env } from "@/lib/env";

interface AddressFormProps {
  value?: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  onValidationChange?: (isValid: boolean) => void;
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

export function AddressForm({
  value,
  onChange,
  onValidationChange,
  className,
}: AddressFormProps) {
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
        city: addressComponents.locality || addressComponents.sublocality || "",
        state: addressComponents.administrative_area_level_1 || "",
        country: addressComponents.country || "",
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      onChange(newAddress);
    });

    return () => {
      if (autocompleteInstance.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteInstance.current
        );
      }
    };
  }, [isLoaded, onChange]);

  // Validate address
  useEffect(() => {
    const hasRequiredFields = !!(
      value?.street_address &&
      value?.postal_code &&
      value?.city &&
      value?.state &&
      value?.country
    );

    onValidationChange?.(hasRequiredFields);
  }, [value, onValidationChange]);

  const handleInputChange = (field: keyof Address, inputValue: string) => {
    onChange({
      ...value,
      [field]: inputValue,
    });
  };

  // Google Map Preview Effect
  useEffect(() => {
    if (!isLoaded) return;
    if (!value?.latitude || !value?.longitude) return;
    const mapDiv = document.getElementById("address-map-preview");
    if (!mapDiv) return;

    // Clean up previous map instance
    mapDiv.innerHTML = "";

    // Use the global google.maps types
    const map = new window.google.maps.Map(mapDiv, {
      center: { lat: value.latitude, lng: value.longitude },
      zoom: 16,
      disableDefaultUI: true,
      gestureHandling: "none",
    });
    new window.google.maps.Marker({
      position: { lat: value.latitude, lng: value.longitude },
      map,
    });
  }, [isLoaded, value?.latitude, value?.longitude]);

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
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          Address
        </Label>
        <Input
          ref={autocompleteRef}
          placeholder="Start typing your address..."
          value={value?.street_address || ""}
          onChange={(e) => handleInputChange("street_address", e.target.value)}
          className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
        />
        <p className="text-gray-500 text-sm mt-2">
          Start typing to see address suggestions from Google Maps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            Unit Number
          </Label>
          <Input
            placeholder="Apt, Suite, etc. (optional)"
            value={value?.unit_number || ""}
            onChange={(e) => handleInputChange("unit_number", e.target.value)}
            className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
          />
        </div>

        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            Postal Code
          </Label>
          <Input
            placeholder="Enter postal code"
            value={value?.postal_code || ""}
            onChange={(e) => handleInputChange("postal_code", e.target.value)}
            className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            City
          </Label>
          <Input
            placeholder="Enter city"
            value={value?.city || ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
          />
        </div>

        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            State/Province
          </Label>
          <Input
            placeholder="Enter state/province"
            value={value?.state || ""}
            onChange={(e) => handleInputChange("state", e.target.value)}
            className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          Country
        </Label>
        <Input
          placeholder="Enter country"
          value={value?.country || ""}
          onChange={(e) => handleInputChange("country", e.target.value)}
          className="h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 ease-out bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg"
        />
      </div>

      {value?.latitude && value?.longitude && (
        <div className="rounded-lg border border-blue-200 overflow-hidden bg-blue-50">
          <div
            id="address-map-preview"
            style={{ width: "100%", height: 240 }}
          />
        </div>
      )}
    </div>
  );
}
