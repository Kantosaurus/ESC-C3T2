import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useElderDetails } from "./use-elder-details";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Share2,
  User,
  Calendar,
  Phone,
  MapPin,
  Edit,
  QrCode,
  ChevronRight,
  Heart,
  Activity,
  Navigation,
} from "lucide-react";
import { env } from "@/lib/env";
import Card from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";

interface InviteLinkResponse {
  inviteLink: string;
  elderId: number;
}

export default function ElderProfilePage() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const { elderDetails, isLoading, error } = useElderDetails(Number(elderId));
  const [inviteLink, setInviteLink] = useState<string>("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<object | null>(null);

  const generateInviteLink = useCallback(async () => {
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
  }, [elderId]);

  useEffect(() => {
    if (elderId) {
      generateInviteLink();
    }
  }, [elderId, generateInviteLink]);

  // Load Google Maps API
  useEffect(() => {
    if (!env.GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not found");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map when elder details and map are loaded
  useEffect(() => {
    if (!isMapLoaded || !elderDetails || !mapRef.current) return;

    const latitude = elderDetails?.latitude;
    const longitude = elderDetails?.longitude;

    if (latitude && longitude) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: {
          lat: latitude,
          lng: longitude,
        },
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: "cooperative",
      });

      new window.google.maps.Marker({
        position: {
          lat: latitude,
          lng: longitude,
        },
        map,
      });

      mapInstanceRef.current = map;
    }
  }, [isMapLoaded, elderDetails]);

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
    return <PageLoader loading={true} pageType="elder-profile" />;
  }

  if (error || !elderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-medium">
            Failed to load profile
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const hasMapData = elderDetails.latitude && elderDetails.longitude;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">
                Elder Profile
              </h1>
            </div>
            <Button
              onClick={() => navigate(`/elder/${elderId}/edit`)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {elderDetails.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-slate-600">
                    <span className="capitalize">{elderDetails.gender}</span>
                    <span>•</span>
                    <span>{getAge(elderDetails.date_of_birth)} years old</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Date of Birth
                    </p>
                    <p className="text-slate-900 font-semibold">
                      {new Date(elderDetails.date_of_birth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {elderDetails.phone && (
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">
                        Phone
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {elderDetails.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl md:col-span-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Address
                    </p>
                    <p className="text-slate-900 font-semibold leading-relaxed">
                      {elderDetails.street_address}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Section */}
            <Card delay={0.1}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Location
                  </h3>
                </div>
                {hasMapData && (
                  <Button
                    onClick={openInGoogleMaps}
                    variant="outline"
                    size="sm"
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                )}
              </div>

              {hasMapData ? (
                <div className="relative">
                  <div
                    ref={mapRef}
                    className="w-full h-64 rounded-xl border border-slate-200 overflow-hidden"
                  />
                  {!isMapLoaded && (
                    <div className="absolute inset-0 bg-slate-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm text-slate-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 mb-2 font-medium">
                    No location data available
                  </p>
                  <p className="text-sm text-slate-500">
                    Location will appear here once coordinates are added
                  </p>
                </div>
              )}
            </Card>

            {/* Care Status */}
            <Card delay={0.2}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Care Status
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                  <div className="text-sm text-blue-700 font-medium">
                    Today's Tasks
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    0
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">
                    Completed
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    1
                  </div>
                  <div className="text-sm text-purple-700 font-medium">
                    Caregivers
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Section */}
            <Card horizontal delay={0.3}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Invite Caregivers
                </h3>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Share this link with other caregivers to invite them to help
                care for {elderDetails.name}.
              </p>

              {isGeneratingLink ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-sm text-slate-600">
                    Generating invite link...
                  </p>
                </div>
              ) : inviteLink ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2 font-medium">
                      INVITE LINK
                    </p>
                    <p className="text-sm text-slate-900 break-all font-mono">
                      {inviteLink}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-200 hover:bg-slate-50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      onClick={shareInviteLink}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-200 hover:bg-slate-50"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={generateInviteLink}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  Generate Invite Link
                </Button>
              )}
            </Card>

            {/* Quick Actions */}
            <Card horizontal delay={0.4}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/elder/${elderId}/tasks`)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-900">
                      View Tasks
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate(`/elder/${elderId}/notes`)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="font-medium text-slate-900">
                      Care Notes
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate(`/elder/${elderId}/schedule`)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-900">Schedule</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
