import { http } from "@/lib/http";
import { ElderForm, type ElderFormType } from "./elder.form";
import { useNavigate } from "react-router";
import type { NewElderDto } from "@carely/core";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewForm from "@/components/ui/new-form";

const addNewElder = (values: NewElderDto) =>
  http()
    .post("/api/elder/new", values)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error creating elder:", error);
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

export default function NewElderPage() {
  const navigate = useNavigate();
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
      await addNewElder(values);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create elder:", error);
      // Don't navigate on error
    }
  };

  return (
    <NewForm
      title="Add a New Elder"
      description="Please provide the details of the elder you are caring for. This helps us tailor our services to their needs and ensure the best support."
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
