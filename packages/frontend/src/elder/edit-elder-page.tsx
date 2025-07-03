import { useParams, useNavigate } from "react-router-dom";
import { useElderDetails } from "./use-elder-details";
import { ElderForm, type ElderFormType } from "./elder.form";
import { http } from "@/lib/http";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

const updateElder = (elderId: number, values: ElderFormType) =>
  http()
    .patch(`/api/elder/${elderId}`, {
      ...values,
      date_of_birth: new Date(values.date_of_birth),
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error updating elder:", error);
      throw error;
    });

const geocodeAddress = async (address: string) => {
  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "OK" && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  }
  return null;
};

export default function EditElderPage() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const { elderDetails, isLoading, error } = useElderDetails(Number(elderId));

  const handleSubmit = async (values: ElderFormType) => {
    if (!elderId) return;
    try {
      let addressDetails = values.address_details;
      // If address_details exists but no lat/lng, geocode
      if (
        addressDetails &&
        (addressDetails.latitude == null || addressDetails.longitude == null)
      ) {
        const coords = await geocodeAddress(values.address);
        if (coords) {
          addressDetails = {
            ...addressDetails,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      }
      await updateElder(Number(elderId), {
        ...values,
        address_details: addressDetails,
      });
      navigate(`/elder/${elderId}/profile`);
    } catch (error) {
      console.error("Failed to update elder:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elder details...</p>
        </div>
      </div>
    );
  }

  if (error || !elderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load elder details</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Convert elder details to form format
  const defaultValues = {
    name: elderDetails.name,
    date_of_birth: new Date(elderDetails.date_of_birth)
      .toISOString()
      .split("T")[0],
    gender: elderDetails.gender,
    phone: elderDetails.phone || "",
    address: elderDetails.address,
    address_details: elderDetails.address_details,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/elder/${elderId}/profile`)}
              className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Elder Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Update {elderDetails.name}'s Information
            </h2>
            <p className="text-gray-600">
              Make changes to the elder's profile information below.
            </p>
          </div>
          <ElderForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            submitLabel="Update Elder"
          />
        </div>
      </div>
    </div>
  );
}
