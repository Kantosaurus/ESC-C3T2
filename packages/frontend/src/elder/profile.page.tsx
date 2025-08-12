import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useElderDetails } from "./use-elder-details";
import { useElderNotes } from "./use-elder-notes";
import { useCaregiversByElderId } from "@/caregiver/use-caregivers-by-elder";
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
  QrCode,
  Heart,
  Navigation,
  Eye,
  X,
  FileText,
} from "lucide-react";
import { env } from "@/lib/env";
import { PageLoader } from "@/components/ui/page-loader";
import AppNavbar from "@/nav/navbar";
import { toast } from "sonner";
import QRCode from "qrcode";

interface InviteLinkResponse {
  inviteLink: string;
  elderId: number;
}

export default function ElderProfilePage() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const { elderDetails, isLoading, error } = useElderDetails(Number(elderId));
  const {
    notes,
    isLoading: notesLoading,
    error: notesError,
  } = useElderNotes(Number(elderId));
  const {
    caregivers,
    isLoading: caregiversLoading,
    error: caregiversError,
  } = useCaregiversByElderId(Number(elderId));
  const [inviteLink, setInviteLink] = useState<string>("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("caregivers");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
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

      // Generate QR code for the invite link
      try {
        const qrCodeUrl = await QRCode.toDataURL(response.data.inviteLink, {
          width: 200,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
        });
        setQrCodeDataUrl(qrCodeUrl);
      } catch (qrError) {
        console.error("Failed to generate QR code:", qrError);
      }

      setShowInviteModal(true);
    } catch (error) {
      console.error("Failed to generate invite link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  }, [elderId]);

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

    if (latitude && longitude && window.google?.maps?.Map) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: {
          lat: latitude,
          lng: longitude,
        },
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: "cooperative",
      });

      if (window.google?.maps?.Marker) {
        new window.google.maps.Marker({
        position: {
          lat: latitude,
          lng: longitude,
        },
        map,
        });
      }

      mapInstanceRef.current = map;
    }
  }, [isMapLoaded, elderDetails]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy invite link");
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

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getCaregiverAge = (dateOfBirth: Date | undefined) => {
    if (!dateOfBirth) return "Unknown age";
    return getAge(dateOfBirth);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <PageLoader loading={true} pageType="elder-profile" />;
  }

  if (error || !elderDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <AppNavbar />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-start gap-8">
            {/* Profile Picture */}
            {elderDetails.profile_picture ? (
              <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={elderDetails.profile_picture}
                  alt={`${elderDetails.name}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg flex-shrink-0">
                {getInitials(elderDetails.name)}
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {elderDetails.name}
                </h1>
              </div>
              <p className="text-lg text-gray-600 mb-4">
                {getAge(elderDetails.date_of_birth)} years old •{" "}
                {elderDetails.gender}
              </p>

              {/* Address */}
              {elderDetails.street_address && (
                <p className="text-gray-700 mb-6 max-w-2xl">
                  📍 {elderDetails.street_address}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button
                  onClick={() => navigate(`/elder/${elderId}/edit`)}
                  className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={generateInviteLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  disabled={isGeneratingLink}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {isGeneratingLink ? "Generating..." : "Invite"}
                </Button>
              </div>

              {/* Statistics */}
              <div className="flex gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Caregivers</span>
                  <span className="font-semibold text-gray-900">1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Age</span>
                  <span className="font-semibold text-gray-900">
                    {getAge(elderDetails.date_of_birth)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(elderDetails.created_at).split(" ")[2]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              {
                id: "caregivers",
                label: "My Caregivers",
                count: 1,
              },
              { id: "calendar", label: "My Calendar", count: 0 },
              { id: "notes", label: "My Notes", count: notes.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-xs text-gray-400">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "caregivers" && (
          <div className="space-y-8">
            {/* Caregivers Grid */}
            {caregiversLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-600">Loading caregivers...</p>
              </div>
            ) : caregiversError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{caregiversError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Retry
                </Button>
              </div>
            ) : caregivers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Caregivers Yet
                </h4>
                <p className="text-gray-600 mb-6">
                  This elder doesn't have any caregivers assigned yet.
                </p>
                <Button
                  onClick={generateInviteLink}
                  disabled={isGeneratingLink}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingLink ? "Generating..." : "Invite Caregivers"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caregivers.map((caregiver) => (
                  <div
                    key={caregiver.id}
                    className="bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/caregiver/${caregiver.id}`)}
                  >
                    {/* Caregiver Preview */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-xl font-semibold shadow-sm">
                        {getInitials(caregiver.name)}
                      </div>
                    </div>

                    {/* Caregiver Info */}
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {caregiver.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getCaregiverAge(caregiver.date_of_birth)} years old •
                        Caregiver
                      </p>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>Profile</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Calendar Placeholder */}
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Calendar View
              </h4>
              <p className="text-gray-600 mb-6">
                View and manage appointments for {elderDetails.name}.
              </p>
              <Button
                onClick={() => navigate("/calendar")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Calendar
              </Button>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-6">
            {notesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Loading notes...</p>
              </div>
            ) : notesError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4 font-medium">
                  Failed to load notes
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Try Again
                </Button>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Notes Yet
                </h4>
                <p className="text-gray-600 mb-6">
                  Notes about {elderDetails.name} will appear here.
                </p>
                <Button
                  onClick={() => navigate("/notes/new")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/notes/${note.id}/edit`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {note.header}
                    </h3>

                    {note.content && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {note.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>
                          {note.caregiver_name || "Unknown Caregiver"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Contact Information
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Date of Birth
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(elderDetails.date_of_birth)}
                  </p>
                </div>
              </div>

              {elderDetails.phone && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone</p>
                    <p className="text-gray-900 font-semibold">
                      {elderDetails.phone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Address
                  </p>
                  <p className="text-gray-900 font-semibold leading-relaxed">
                    {elderDetails.street_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Location
                </h3>
              </div>
              {hasMapData && (
                <Button
                  onClick={openInGoogleMaps}
                  variant="outline"
                  size="sm"
                  className="border-gray-200 hover:bg-gray-50"
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
                  className="w-full h-64 rounded-xl border border-gray-200 overflow-hidden"
                />
                {!isMapLoaded && (
                  <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2 font-medium">
                  No location data available
                </p>
                <p className="text-sm text-gray-500">
                  Location will appear here once coordinates are added
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Care Status */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
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
                <div className="text-2xl font-bold text-purple-600 mb-1">1</div>
                <div className="text-sm text-purple-700 font-medium">
                  Caregivers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Invite Modal */}
      {showInviteModal && inviteLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
            {/* Close Button */}
            <button
              data-testid="close-invite-modal"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Invite Caregivers
                </h3>
                <p className="text-sm text-gray-600">
                  Share this link with other caregivers
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Share this link or QR code with other caregivers to invite them to
              help care for{" "}
              <span className="font-semibold text-gray-900">
                {elderDetails.name}
              </span>
              .
            </p>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="flex justify-center mb-6">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code for invite link"
                  className="w-48 h-48 rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Invite Link */}
            <div className="p-4 bg-white/50 rounded-xl border border-white/30 mb-6">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                INVITE LINK
              </p>
              <p 
                data-testid="invite-link"
                className="text-sm text-gray-900 break-all font-mono bg-white/30 p-2 rounded-lg"
              >
                {inviteLink}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1 border-white/30 bg-white/20 hover:bg-white/30 text-gray-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={shareInviteLink}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
