import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useElderDetails } from "./use-elder-details";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Share2, MapPin, Users, Calendar } from "lucide-react";

interface InviteLinkResponse {
  inviteLink: string;
  elderId: number;
}

export default function ElderProfilePage() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const { elderDetails, isLoading, error } = useElderDetails(Number(elderId));
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const generateInviteLink = async () => {
    if (!elderId) return;

    setIsGeneratingLink(true);
    try {
      const response = await http().get<InviteLinkResponse>(
        `/api/elder/invite?elderId=${elderId}`
      );
      setInviteLink(response.data.inviteLink);
    } catch (error) {
      console.error("Failed to generate invite link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  useEffect(() => {
    if (elderId) {
      generateInviteLink();
    }
  }, [elderId, generateInviteLink]);

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
          text: `You've been invited to help care for ${elderDetails?.name}. Click the link to join.`,
          url: inviteLink,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  const openInGoogleMaps = () => {
    if (elderDetails?.latitude && elderDetails?.longitude) {
      const url = `https://www.google.com/maps?q=${elderDetails.latitude},${elderDetails.longitude}`;
      window.open(url, "_blank");
    } else {
      // Fallback to address search
      const url = `https://www.google.com/maps/search/${encodeURIComponent(
        elderDetails?.street_address ?? ""
      )}`;
      window.open(url, "_blank");
    }
  };

  const getAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {elderDetails.name}'s Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{elderDetails.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <p className="text-gray-900">
                    {getAge(elderDetails.date_of_birth)} years old
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <p className="text-gray-900 capitalize">
                    {elderDetails.gender}
                  </p>
                </div>
                {elderDetails.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{elderDetails.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information Card */}
            {(elderDetails.street_address ||
              elderDetails.unit_number ||
              elderDetails.postal_code) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Address Information
                </h2>
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
                      Singapore {elderDetails.postal_code}
                    </p>
                  )}
                  {(elderDetails.latitude || elderDetails.longitude) && (
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
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

            {/* Invite Caregivers Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Invite Caregivers
              </h2>
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
                  <div className="flex items-center space-x-2">
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
                  {inviteLink && (
                    <div className="text-xs text-gray-500 break-all">
                      {inviteLink}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
