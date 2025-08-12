// Minimal type definitions for Google Maps objects used in the application
export interface GoogleMapsAutocomplete {
  addListener: (event: string, callback: () => void) => void;
  getPlace: () => GoogleMapsPlace;
  unbindAll?: () => void;
}

export interface GoogleMapsPlace {
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
  formatted_address?: string;
}

export interface GoogleMapsMap {
  setCenter: (latLng: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  [key: string]: unknown;
}

export interface GoogleMapsMarker {
  setMap: (map: GoogleMapsMap | null) => void;
  setPosition: (latLng: { lat: number; lng: number }) => void;
  [key: string]: unknown;
}

export interface GoogleMapsEvent {
  clearInstanceListeners: (instance: GoogleMapsAutocomplete | GoogleMapsMap | GoogleMapsMarker) => void;
}

// Global window interface extension
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              fields?: string[];
              componentRestrictions?: { country?: string | string[] };
            }
          ) => GoogleMapsAutocomplete;
          PlacesServiceStatus: {
            OK: string;
          };
        };
        event: GoogleMapsEvent;
        Map: new (
          mapDiv: HTMLElement,
          options: {
            center: { lat: number; lng: number };
            zoom: number;
            disableDefaultUI?: boolean;
            gestureHandling?: string;
          }
        ) => GoogleMapsMap;
        Marker: new (options: {
          position: { lat: number; lng: number };
          map?: GoogleMapsMap | null;
        }) => GoogleMapsMarker;
      };
    } | undefined;
    initGoogleMaps?: () => void;
  }
}