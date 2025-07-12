import { useCaregiver } from "./use-caregiver";
import { useEldersDetails } from "@/elder/use-elder-details";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback, useState } from "react";
import { http } from "@/lib/http";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  Calendar,
  Phone,
  MapPin,
  Users,
  Heart,
  Edit3,
  ArrowLeft,
  Clock,
  Star,
} from "lucide-react";

export default function ProfilePage() {
  const { caregiverDetails, isLoading: caregiverLoading } = useCaregiver();
  const { elderDetails, isLoading: eldersLoading } = useEldersDetails();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (values: CaregiverFormType) => {
    setSuccess("");
    setError("");
    try {
      await http().patch("/api/caregiver/self", values);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch {
      setError("Failed to update profile. Please try again.");
    }
  }, []);

  const isLoading = caregiverLoading || eldersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!caregiverDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile information.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Convert date_of_birth to string for the form
  const formDefaults = {
    ...caregiverDetails,
    date_of_birth: caregiverDetails.date_of_birth
      ? new Date(caregiverDetails.date_of_birth).toISOString().slice(0, 10)
      : "",
    phone: caregiverDetails.phone ?? undefined,
    address: caregiverDetails.address ?? undefined,
    address_details: caregiverDetails.address_details ?? undefined,
  };

  // Helper functions
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case "male":
        return "👨";
      case "female":
        return "👩";
      default:
        return "👤";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="flex items-center space-x-2">
              <Edit3 className="h-4 w-4" />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                  {getInitials(caregiverDetails.name)}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {caregiverDetails.name}
                </h2>
                <p className="text-gray-600 flex items-center justify-center">
                  <span className="mr-2">
                    {getGenderIcon(caregiverDetails.gender)}
                  </span>
                  {caregiverDetails.gender.charAt(0).toUpperCase() +
                    caregiverDetails.gender.slice(1)}
                </p>
              </div>

              {/* Profile Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Elders in Care</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {elderDetails?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Age</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {caregiverDetails.date_of_birth
                      ? getAge(caregiverDetails.date_of_birth)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">Member Since</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {formatDate(caregiverDetails.created_at)}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contact Information
                </h3>

                {caregiverDetails.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-blue-600" />
                    <span>{caregiverDetails.phone}</span>
                  </div>
                )}

                {caregiverDetails.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-blue-600 mt-0.5" />
                    <span className="text-sm">{caregiverDetails.address}</span>
                  </div>
                )}

                {caregiverDetails.address_details && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div>
                        {caregiverDetails.address_details.street_address}
                      </div>
                      {caregiverDetails.address_details.unit_number && (
                        <div>
                          Unit {caregiverDetails.address_details.unit_number}
                        </div>
                      )}
                      <div>
                        {caregiverDetails.address_details.city},{" "}
                        {caregiverDetails.address_details.state}{" "}
                        {caregiverDetails.address_details.postal_code}
                      </div>
                      <div>{caregiverDetails.address_details.country}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form or Elders List */}
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Edit Profile
                </h3>
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                <CaregiverForm
                  defaultValues={formDefaults}
                  onSubmit={handleSubmit}
                  submitLabel="Update Profile"
                />
              </motion.div>
            ) : (
              <>
                {/* Elders in Care Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Heart className="h-6 w-6 text-red-500 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Elders in Your Care
                      </h3>
                    </div>
                    <Button
                      onClick={() => navigate("/elder/new")}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700">
                      Add Elder
                    </Button>
                  </div>

                  {elderDetails && elderDetails.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {elderDetails.map((elder, index) => (
                        <motion.div
                          key={elder.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1 + index * 0.1,
                          }}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() =>
                            navigate(`/elder/${elder.id}/profile`)
                          }>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                                {getInitials(elder.name)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {elder.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {elder.date_of_birth
                                    ? getAge(elder.date_of_birth)
                                    : "N/A"}{" "}
                                  years old
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl">
                              {getGenderIcon(elder.gender)}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            {elder.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-2" />
                                {elder.phone}
                              </div>
                            )}
                            {elder.address && (
                              <div className="flex items-start">
                                <MapPin className="h-3 w-3 mr-2 mt-0.5" />
                                <span className="line-clamp-2">
                                  {elder.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Elders Yet
                      </h4>
                      <p className="text-gray-600 mb-6">
                        You haven't added any elders to your care yet. Start by
                        adding your first elder.
                      </p>
                      <Button
                        onClick={() => navigate("/elder/new")}
                        className="bg-blue-600 hover:bg-blue-700">
                        Add Your First Elder
                      </Button>
                    </div>
                  )}
                </motion.div>

                {/* Caregiving Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-6 w-6 text-yellow-500 mr-3" />
                    Caregiving Statistics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {elderDetails?.length || 0}
                      </div>
                      <div className="text-sm text-blue-700">Total Elders</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {elderDetails?.filter((e) => e.gender === "male")
                          .length || 0}
                      </div>
                      <div className="text-sm text-green-700">Male Elders</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {elderDetails?.filter((e) => e.gender === "female")
                          .length || 0}
                      </div>
                      <div className="text-sm text-purple-700">
                        Female Elders
                      </div>
                    </div>
                  </div>

                  {elderDetails && elderDetails.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Elders by Age Group
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          const ageGroups = {
                            "65-74": elderDetails.filter((e) => {
                              const age = e.date_of_birth
                                ? getAge(e.date_of_birth)
                                : 0;
                              return age >= 65 && age <= 74;
                            }).length,
                            "75-84": elderDetails.filter((e) => {
                              const age = e.date_of_birth
                                ? getAge(e.date_of_birth)
                                : 0;
                              return age >= 75 && age <= 84;
                            }).length,
                            "85+": elderDetails.filter((e) => {
                              const age = e.date_of_birth
                                ? getAge(e.date_of_birth)
                                : 0;
                              return age >= 85;
                            }).length,
                          };

                          return Object.entries(ageGroups).map(
                            ([range, count]) => (
                              <div
                                key={range}
                                className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  {range} years
                                </span>
                                <span className="font-medium text-gray-900">
                                  {count} elder{count !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
