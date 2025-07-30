import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useElderDetails } from "./use-elder-details";
import { http } from "@/lib/http";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Copy,
  Share2,
  User,
  Phone,
  Edit3,
  Heart,
  Clock,
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
      const response = await http().get(`/api/elder/invite`, {
        params: {
          elderId: elderId,
        },
      });

      console.log("Generated invite link:", response.data.inviteLink);
      setInviteLink(response.data.inviteLink);
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
    if (!inviteLink) {
      console.error("No invite link available to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const shareInviteLink = async () => {
    if (!inviteLink) {
      console.error("No invite link available to share");
      return;
    }

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

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elder profile...</p>
        </div>
      </div>
    );
  }

  if (error || !elderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Elder not found
          </h1>
          <p className="text-gray-600 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-medium text-gray-900">
                Elder Profile
              </h1>
            </div>
            <Button
              onClick={() => navigate(`/elder/${elderId}/edit`)}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card>
              <div className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getInitials(elderDetails.name)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {elderDetails.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {elderDetails.date_of_birth
                            ? `${getAge(elderDetails.date_of_birth)} years old`
                            : "Age not specified"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span className="capitalize">
                          {elderDetails.gender || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span>Contact Information</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {elderDetails.phone || "Phone number not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Address Card */}
            {(elderDetails.street_address ||
              elderDetails.unit_number ||
              elderDetails.postal_code ||
              (elderDetails.latitude && elderDetails.longitude)) && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <span>Location</span>
                  </h3>
                  <div className="space-y-3">
                    {elderDetails.street_address && (
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {elderDetails.street_address}
                          </p>
                          {elderDetails.unit_number && (
                            <p className="text-gray-600 text-sm">
                              Unit {elderDetails.unit_number}
                            </p>
                          )}
                          {elderDetails.postal_code && (
                            <p className="text-gray-600 text-sm">
                              {elderDetails.postal_code}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {elderDetails.latitude && elderDetails.longitude && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-blue-900 font-medium">
                              Location Coordinates
                            </p>
                            <p className="text-blue-700 text-sm">
                              {elderDetails.latitude?.toFixed(6)},{" "}
                              {elderDetails.longitude?.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openInGoogleMaps}
                          className="flex items-center space-x-2"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Open Maps</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate(`/elder/${elderId}/edit`)}
                    variant="outline"
                    className="h-12 justify-start"
                  >
                    <Edit3 className="h-4 w-4 mr-3" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => navigate(`/elder/${elderId}/appointments`)}
                    variant="outline"
                    className="h-12 justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    View Appointments
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Caregivers Card */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invite Caregivers
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Share access with other caregivers to help care for{" "}
                  <span className="font-medium">{elderDetails.name}</span>.
                </p>

                {isGeneratingLink ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">
                      Generating invite link...
                    </p>
                  </div>
                ) : inviteLink ? (
                  <div className="space-y-3">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="w-full h-11"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy Invite Link"}
                    </Button>
                    <Button
                      onClick={shareInviteLink}
                      variant="outline"
                      className="w-full h-11"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Share2 className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Failed to generate invite link
                    </p>
                    <Button
                      onClick={generateInviteLink}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Care Status Card */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Care Status
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">Status</span>
                    <span className="text-green-700 text-sm font-medium">
                      Active Care
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">
                      Caregivers
                    </span>
                    <span className="text-blue-700 text-sm font-medium">1</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
