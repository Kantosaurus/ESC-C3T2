import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useElderDetails } from "./use-elder-details";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Copy,
  Share2,
  User,
} from "lucide-react";

export const ElderProfilePage = () => {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const { elderDetails, isLoading, error } = useElderDetails(
    elderId ? Number(elderId) : null
  );
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateInviteLink = useCallback(async () => {
    if (!elderId) return;

    setIsGeneratingLink(true);
    try {
      const response = await fetch(`/api/elder/${elderId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInviteLink(data.inviteLink);
      } else {
        console.error("Failed to generate invite link");
      }
    } catch (error) {
      console.error("Error generating invite link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  }, [elderId]);

  useEffect(() => {
    generateInviteLink();
  }, [generateInviteLink]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invite to care for ${elderDetails?.name}`,
          text: `Join me in caring for ${elderDetails?.name}. Click the link to get started:`,
          url: inviteLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  const openInGoogleMaps = () => {
    if (elderDetails?.latitude && elderDetails?.longitude) {
      const url = `https://www.google.com/maps?q=${elderDetails.latitude},${elderDetails.longitude}`;
      window.open(url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !elderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Elder not found
          </h1>
          <p className="text-gray-600 mb-4">
            The elder you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                {elderDetails.name}
              </h2>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Personal Information
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Age:</span>{" "}
                        {elderDetails.date_of_birth
                          ? new Date().getFullYear() -
                            new Date(elderDetails.date_of_birth).getFullYear()
                          : "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Gender:</span>{" "}
                        {elderDetails.gender || "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span>{" "}
                        {elderDetails.phone || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Address
                    </h3>
                    <div className="space-y-2">
                      {elderDetails.street_address && (
                        <p className="text-gray-900">
                          {elderDetails.street_address}
                        </p>
                      )}
                      {elderDetails.unit_number && (
                        <p className="text-gray-600">
                          Unit {elderDetails.unit_number}
                        </p>
                      )}
                      {elderDetails.postal_code && (
                        <p className="text-gray-600">
                          {elderDetails.postal_code}
                        </p>
                      )}
                      {elderDetails.latitude && elderDetails.longitude && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            📍 Location coordinates:{" "}
                            {elderDetails.latitude?.toFixed(6)},{" "}
                            {elderDetails.longitude?.toFixed(6)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={openInGoogleMaps}
                            className="flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4" />
                            Open in Google Maps
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate(`/elder/${elderId}/edit`)}
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/elder/${elderId}/appointments`)}
                    className="w-full justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Invite Card */}
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Invite Caregivers
              </h2>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Share Access
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share this link with other caregivers to invite them to help
                  care for {elderDetails.name}.
                </p>

                {isGeneratingLink ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      Generating link...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button
                        onClick={shareInviteLink}
                        variant="outline"
                        size="sm"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
