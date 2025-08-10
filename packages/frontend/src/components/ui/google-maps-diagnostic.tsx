import { useEffect, useState } from "react";
import { env } from "@/lib/env";
import "@/types/google-maps";

export function GoogleMapsDiagnostic() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<{
    apiKeyPresent: boolean;
    apiKeyLength: number;
    apiLoaded: boolean;
    placesLoaded: boolean;
    autocompleteAvailable: boolean;
    scriptExists: boolean;
    networkError?: string;
    errorMessage?: string;
  }>({
    apiKeyPresent: false,
    apiKeyLength: 0,
    apiLoaded: false,
    placesLoaded: false,
    autocompleteAvailable: false,
    scriptExists: false,
  });

  useEffect(() => {
    const checkGoogleMaps = () => {
      const apiKeyPresent = !!env.GOOGLE_MAPS_API_KEY;
      const apiKeyLength = env.GOOGLE_MAPS_API_KEY?.length || 0;
      const apiLoaded = !!window.google?.maps;
      const placesLoaded = !!window.google?.maps?.places;
      const autocompleteAvailable = !!window.google?.maps?.places?.Autocomplete;
      const scriptExists = !!document.querySelector('script[src*="maps.googleapis.com"]');

      let errorMessage;
      if (!apiKeyPresent) {
        errorMessage = "Google Maps API key not found";
      } else if (apiKeyLength < 30) {
        errorMessage = "API key seems too short - check configuration";
      }

      setDiagnosticInfo({
        apiKeyPresent,
        apiKeyLength,
        apiLoaded,
        placesLoaded,
        autocompleteAvailable,
        scriptExists,
        errorMessage,
      });
    };

    checkGoogleMaps();
    const interval = setInterval(checkGoogleMaps, 1000);
    return () => clearInterval(interval);
  }, []);

  // Only show diagnostic in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-gray-100 rounded-md text-xs font-mono">
      <div className="font-bold mb-2">Google Maps Diagnostic:</div>
      <div className={`flex items-center gap-2 ${diagnosticInfo.apiKeyPresent ? 'text-green-600' : 'text-red-600'}`}>
        <span>{diagnosticInfo.apiKeyPresent ? '✓' : '✗'}</span>
        <span>API Key Present ({diagnosticInfo.apiKeyLength} chars)</span>
      </div>
      <div className={`flex items-center gap-2 ${diagnosticInfo.scriptExists ? 'text-green-600' : 'text-orange-600'}`}>
        <span>{diagnosticInfo.scriptExists ? '✓' : '⏳'}</span>
        <span>Script Tag Added to DOM</span>
      </div>
      <div className={`flex items-center gap-2 ${diagnosticInfo.apiLoaded ? 'text-green-600' : 'text-orange-600'}`}>
        <span>{diagnosticInfo.apiLoaded ? '✓' : '⏳'}</span>
        <span>Google Maps API Loaded</span>
      </div>
      <div className={`flex items-center gap-2 ${diagnosticInfo.placesLoaded ? 'text-green-600' : 'text-orange-600'}`}>
        <span>{diagnosticInfo.placesLoaded ? '✓' : '⏳'}</span>
        <span>Places Library Loaded</span>
      </div>
      <div className={`flex items-center gap-2 ${diagnosticInfo.autocompleteAvailable ? 'text-green-600' : 'text-orange-600'}`}>
        <span>{diagnosticInfo.autocompleteAvailable ? '✓' : '⏳'}</span>
        <span>Autocomplete Available</span>
      </div>
      {diagnosticInfo.errorMessage && (
        <div className="text-red-600 mt-2">{diagnosticInfo.errorMessage}</div>
      )}
      {diagnosticInfo.apiKeyPresent && (
        <div className="text-gray-600 mt-2 text-xs">
          API Key: {env.GOOGLE_MAPS_API_KEY?.substring(0, 10)}...
        </div>
      )}
    </div>
  );
}