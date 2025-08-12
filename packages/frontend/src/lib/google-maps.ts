import { env } from "./env";
import type { GoogleMapsPlace } from "@/types/google-maps";

export interface GoogleMapsLoadState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

let loadPromise: Promise<void> | null = null;
let loadState: GoogleMapsLoadState = {
  isLoaded: false,
  isLoading: false,
  error: null,
};

const listeners: Array<(state: GoogleMapsLoadState) => void> = [];

export function subscribeToLoadState(callback: (state: GoogleMapsLoadState) => void) {
  listeners.push(callback);
  // Immediately notify with current state
  callback(loadState);
  
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyListeners() {
  listeners.forEach(callback => callback(loadState));
}

export function loadGoogleMapsAPI(): Promise<void> {
  if (!env.GOOGLE_MAPS_API_KEY) {
    const error = "Google Maps API key not found";
    loadState = { isLoaded: false, isLoading: false, error };
    notifyListeners();
    return Promise.reject(new Error(error));
  }

  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Return resolved promise if already loaded
  if (window.google?.maps?.places?.Autocomplete) {
    loadState = { isLoaded: true, isLoading: false, error: null };
    notifyListeners();
    return Promise.resolve();
  }

  // Check if script is already in DOM but not loaded
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    loadState = { isLoaded: false, isLoading: true, error: null };
    notifyListeners();
    
    loadPromise = new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (window.google?.maps?.places?.Autocomplete) {
          loadState = { isLoaded: true, isLoading: false, error: null };
          notifyListeners();
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      
      existingScript.addEventListener('error', () => {
        const error = "Failed to load Google Maps API";
        loadState = { isLoaded: false, isLoading: false, error };
        notifyListeners();
        reject(new Error(error));
      });
      
      checkLoaded();
    });
    
    return loadPromise;
  }

  // Load the API
  loadState = { isLoaded: false, isLoading: true, error: null };
  notifyListeners();

  loadPromise = new Promise((resolve, reject) => {
    // Create global callback
    window.initGoogleMaps = () => {
      console.log("Google Maps API loaded successfully");
      loadState = { isLoaded: true, isLoading: false, error: null };
      notifyListeners();
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      const error = "Failed to load Google Maps API - check your API key and network connection";
      console.error(error);
      loadState = { isLoaded: false, isLoading: false, error };
      notifyListeners();
      reject(new Error(error));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export interface ParsedAddress {
  street_address?: string;
  unit_number?: string;
  postal_code?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export function parseGooglePlace(place: GoogleMapsPlace): ParsedAddress {
  const result: ParsedAddress = {};

  if (!place) return result;

  // Get coordinates
  if (place.geometry?.location) {
    result.latitude = place.geometry.location.lat();
    result.longitude = place.geometry.location.lng();
  }

  // Parse address components
  const components: Record<string, string> = {};
  place.address_components?.forEach((component) => {
    const type = component.types[0];
    components[type] = component.long_name;
    components[`${type}_short`] = component.short_name;
  });

  // Build street address
  const streetNumber = components.street_number || '';
  const route = components.route || '';
  result.street_address = `${streetNumber} ${route}`.trim();

  result.unit_number = components.subpremise || '';
  result.postal_code = components.postal_code || '';
  result.city = components.locality || components.administrative_area_level_2 || '';
  result.state = components.administrative_area_level_1 || '';
  result.country = components.country || '';

  return result;
}