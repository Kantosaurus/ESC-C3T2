import { useParams, useNavigate } from "react-router-dom";
import { useCaregiverById } from "./use-caregiver-by-id";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Heart,
  Mail,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import AppNavbar from "@/nav/navbar";

export default function CaregiverProfilePage() {
  const { caregiverId } = useParams<{ caregiverId: string }>();
  const navigate = useNavigate();
  const { caregiverDetails, isLoading, error } = useCaregiverById(
    caregiverId || null
  );

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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <PageLoader loading={true} pageType="profile" />;
  }

  if (error || !caregiverDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Unable to Load Profile
          </h2>
          <p className="text-gray-600 mb-8">
            {error ||
              "We couldn't load the caregiver information. Please try again."}
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {getInitials(caregiverDetails.name)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {caregiverDetails.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {getAge(caregiverDetails.date_of_birth)} years old •{" "}
            {caregiverDetails.gender}
          </p>

          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Active Caregiver
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Contact Information */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              Contact Information
            </h2>

            <div className="space-y-4">
              {caregiverDetails.phone && (
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">
                    {caregiverDetails.phone}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 font-medium">
                  {formatDate(caregiverDetails.date_of_birth)}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-600" />
              Location
            </h2>

            {caregiverDetails.street_address ? (
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-700">
                  <p className="font-medium">
                    {caregiverDetails.street_address}
                  </p>
                  {caregiverDetails.unit_number && (
                    <p className="text-sm text-gray-600">
                      Unit {caregiverDetails.unit_number}
                    </p>
                  )}
                  {caregiverDetails.postal_code && (
                    <p className="text-sm text-gray-600">
                      Singapore {caregiverDetails.postal_code}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  No location data
                </p>
                <p className="text-sm text-gray-500">
                  Location will appear here once added
                </p>
              </div>
            )}
          </div>

          {/* Bio */}
          {caregiverDetails.bio && (
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-600" />
                About
              </h2>
              <p className="text-gray-700 leading-relaxed max-w-2xl">
                {caregiverDetails.bio}
              </p>
            </div>
          )}

          {/* Quick Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {getAge(caregiverDetails.date_of_birth)}
                </div>
                <div className="text-sm text-gray-600">Age</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                  {caregiverDetails.gender}
                </div>
                <div className="text-sm text-gray-600">Gender</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  Active
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
