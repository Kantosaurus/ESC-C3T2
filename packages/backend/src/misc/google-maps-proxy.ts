import { RequestHandler } from "express";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn(
    "Google Maps API key not configured. Maps functionality will be limited."
  );
}

export const geocodeAddressHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(503).json({
        error: "Google Maps API not configured",
        message: "Please configure GOOGLE_MAPS_API_KEY environment variable",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      res.json({
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: data.results[0].formatted_address,
      });
    } else {
      res.status(404).json({
        error: "Address not found",
        status: data.status,
        message: data.error_message || "No results found for this address",
      });
    }
  } catch (error) {
    console.error("Error in geocoding:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlacesAutocompleteHandler: RequestHandler = async (
  req,
  res
) => {
  try {
    const { input } = req.query;

    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Input parameter is required" });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(503).json({
        error: "Google Maps API not configured",
        message: "Please configure GOOGLE_MAPS_API_KEY environment variable",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_MAPS_API_KEY}&types=address`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      res.json({
        predictions: data.predictions.map(
          (prediction: { place_id: string; description: string }) => ({
            place_id: prediction.place_id,
            description: prediction.description,
          })
        ),
      });
    } else {
      res.status(404).json({
        error: "No predictions found",
        status: data.status,
        message: data.error_message || "No autocomplete results found",
      });
    }
  } catch (error) {
    console.error("Error in places autocomplete:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlaceDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const { place_id } = req.query;

    if (!place_id || typeof place_id !== "string") {
      return res.status(400).json({ error: "Place ID parameter is required" });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(503).json({
        error: "Google Maps API not configured",
        message: "Please configure GOOGLE_MAPS_API_KEY environment variable",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      place_id
    )}&key=${GOOGLE_MAPS_API_KEY}&fields=formatted_address,geometry`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      const result = data.result;
      res.json({
        formatted_address: result.formatted_address,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng,
      });
    } else {
      res.status(404).json({
        error: "Place details not found",
        status: data.status,
        message: data.error_message || "No place details found",
      });
    }
  } catch (error) {
    console.error("Error in place details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
