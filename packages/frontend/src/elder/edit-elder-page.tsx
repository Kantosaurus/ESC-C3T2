import { http } from "@/lib/http";
import { ElderForm, type ElderFormType } from "./elder.form";
import { useNavigate, useParams } from "react-router";
import type { NewElderDto } from "@carely/core";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewForm from "@/components/ui/new-form";

const updateElder = (elderId: number, values: NewElderDto) =>
  http()
    .patch(`/api/elder/${elderId}`, values)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error updating elder:", error);
      throw error;
    });

const geocodeAddress = async (address: string) => {
  try {
    const response = await http().get("/api/maps/geocode", {
      params: { address },
    });
    return {
      latitude: response.data.latitude,
      longitude: response.data.longitude,
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

export default function EditElderPage() {
  const navigate = useNavigate();
  const { elderId } = useParams<{ elderId: string }>();

  const handleSubmit = async (values: ElderFormType) => {
    try {
      // If address_details exists but no lat/lng, geocode
      if (
        values.street_address &&
        (values.latitude == null || values.longitude == null)
      ) {
        const coords = await geocodeAddress(values.street_address);
        if (coords) {
          values = {
            ...values,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        }
      }
      await updateElder(parseInt(elderId!, 10), values);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update elder:", error);
      // Don't navigate on error
    }
  };

  return (
    <NewForm
      title="Edit Elder Profile"
      description="Update the details of the elder you are caring for. This helps us tailor our services to their needs and ensure the best support."
      body={
        <>
          <Button
            className="mb-4"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft />
            Back
          </Button>
          <ElderForm onSubmit={handleSubmit} />
        </>
      }
    />
  );
}
