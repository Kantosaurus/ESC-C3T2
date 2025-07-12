import { http } from "@/lib/http";
import { ElderForm, type ElderFormType } from "./elder.form";
import { useNavigate } from "react-router";
import type { NewElderDto } from "@carely/core";
import { UserPlus, ArrowLeft } from "lucide-react";
import { env } from "@/lib/env";

const addNewElder = (values: NewElderDto) =>
  http()
    .post("/api/elder/new", values)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error creating elder:", error);
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

export default function NewElderPage() {
  const navigate = useNavigate();
  const handleSubmit = async (values: ElderFormType) => {
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
      await addNewElder({
        ...values,
        address_details: addressDetails,
        date_of_birth: new Date(values.date_of_birth),
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create elder:", error);
      // Don't navigate on error
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative"
      style={{
        background: `url('/philippe-leone-Y5VBtBgswLQ-unsplash.jpg') center center / cover no-repeat fixed`,
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-blue-50/60 to-indigo-100/60 pointer-events-none" />
      <div
        className="relative w-full max-w-xl rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-12 flex flex-col items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.38) 60%, rgba(245,245,255,0.18) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow:
            "0 4px 32px 0 rgba(31, 38, 135, 0.10), 0 1.5px 0 0 rgba(255,255,255,0.18) inset",
        }}
      >
        <div className="w-full flex justify-start mb-4">
          <button
            type="button"
            className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 transition-colors text-sm font-medium px-2 py-1 bg-transparent border-none shadow-none focus:outline-none focus:underline"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 mb-4 shadow-sm">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 text-center">
            Add a New Elder
          </h1>
          <p className="text-gray-600 text-center max-w-md">
            Please provide the details of the elder you are caring for. This
            helps us tailor our services to their needs and ensure the best
            support.
          </p>
        </div>
        <div className="w-full">
          <ElderForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
