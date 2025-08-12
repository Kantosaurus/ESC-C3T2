import { useParams, useNavigate } from "react-router-dom";
import { useElderDetails } from "./use-elder-details";
import { ElderForm, type ElderFormType } from "./elder.form";
import { http } from "@/lib/http";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import AppNavbar from "@/nav/navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const updateElder = (elderId: number, values: ElderFormType) =>
  http()
    .patch(`/api/elder/${elderId}`, {
      ...values,
      date_of_birth: new Date(values.date_of_birth),
      profile_picture: values.profile_picture || null,
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
      await updateElder(Number(elderId), values);
      navigate(`/elder/${elderId}/profile`);
    } catch (error) {
      console.error("Failed to update elder:", error);
    }
  };

  const handleDeleteElder = async () => {
    if (!elderId) return;
    try {
      await http().delete(`/api/elder/${elderId}`);
      toast.success("Elder deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete elder:", error);
      toast.error("Failed to delete elder");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elder details...</p>
        </div>
      </div>
    );
  }

  if (error || !elderDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    phone: elderDetails.phone ?? undefined,
    bio: elderDetails.bio ?? undefined,
    profile_picture: elderDetails.profile_picture ?? undefined,
    street_address: elderDetails.street_address ?? undefined,
    unit_number: elderDetails.unit_number ?? undefined,
    postal_code: elderDetails.postal_code ?? undefined,
    latitude: elderDetails.latitude ?? undefined,
    longitude: elderDetails.longitude ?? undefined,
  };

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/elder/${elderId}/profile`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600">
            Update {elderDetails.name}'s information and preferences.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <div>
            <ElderForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              submitLabel="Update Profile"
            />
          </div>

          {/* Delete Account Section */}
          <div className="mt-8 bg-white rounded-2xl border border-red-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Delete Elder Account
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    This action cannot be undone. This will permanently delete{" "}
                    {elderDetails.name}'s account and remove all associated
                    data.
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Elder Account</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete {elderDetails.name}'s
                        account? This action cannot be undone and will
                        permanently remove all data associated with this elder.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const dialog = document.querySelector(
                            '[role="dialog"]'
                          ) as HTMLDialogElement;
                          if (dialog) {
                            dialog.close();
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteElder}>
                        Delete Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
