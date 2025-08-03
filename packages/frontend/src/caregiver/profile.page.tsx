import { useCaregiver } from "./use-caregiver";
import { useEldersDetails } from "@/elder/use-elder-details";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback, useState } from "react";
import { http } from "@/lib/http";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  ArrowLeft,
  Clock,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Edit,
  Trash2,
} from "lucide-react";
import AppNavbar from "@/nav/navbar";
import { useGetAllAppointmentsForCaregiver } from "@/calendar/use-appointment";
import type { Appointment } from "@carely/core";
import { DayView } from "@/components/ui/calendardayview";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { IcsImport } from "@/components/ui/ics-import";
import { GlassmorphicModal } from "@/components/ui/glassmorphic-modal";
import { PageLoader } from "@/components/ui/page-loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AppointmentForm,
  type AppointmentFormType,
} from "@/calendar/appointment.form";
import {
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/calendar/use-appointment";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export default function ProfilePage() {
  const {
    caregiverDetails,
    isLoading: caregiverLoading,
    refetch: refetchCaregiver,
  } = useCaregiver();
  const { elderDetails, isLoading: eldersLoading } = useEldersDetails();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("elders");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [sheetView, setSheetView] = useState<
    "dayview" | "details" | "form" | "update"
  >("dayview");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get all appointments for the caregiver
  const { appointments, refetch: refetchAppointments } =
    useGetAllAppointmentsForCaregiver();

  // Appointment handlers
  const addAppointment = useCreateAppointment();
  const handleAppointmentSubmit = async (values: AppointmentFormType) => {
    try {
      await addAppointment(values);
      await refetchAppointments();
      setViewDate(null);
      setSheetView("dayview");
      toast.success("Appointment created");
    } catch (error) {
      const axiosErr = error as AxiosError<{ error: string }>;
      const message = axiosErr.response?.data?.error ?? "Unexpected error";
      toast.error(message);
    }
  };

  const updateAppointment = useUpdateAppointment();
  const handleUpdateSubmit = async (values: AppointmentFormType) => {
    try {
      await updateAppointment(values);
      await refetchAppointments();
      setSheetView("dayview");
      toast.success("Appointment updated");
    } catch (error) {
      console.error("Error updating appointment:", error);
      const axiosErr = error as AxiosError<{ error: string }>;
      const message = axiosErr.response?.data?.error ?? "Unexpected error";
      toast.error(message);
    }
  };

  const deleteAppointment = useDeleteAppointment();
  const handleDeleteAppointment = async (
    values: Pick<AppointmentFormType, "elder_id" | "appt_id">
  ) => {
    try {
      await deleteAppointment(values);
      await refetchAppointments();
      setSelectedAppointment(null);
      setSheetView("dayview");
      toast.success("Appointment deleted");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      const axiosErr = error as AxiosError<{ error: string }>;
      const message = axiosErr.response?.data?.error ?? "Unexpected error";
      toast.error(message);
    }
  };

  const handleSubmit = useCallback(
    async (values: CaregiverFormType) => {
      setSuccess("");
      setError("");
      try {
        await http().patch("/api/caregiver/self", values);
        await refetchCaregiver(); // Refetch caregiver details after successful update
        setSuccess("Profile updated successfully.");
        setIsEditing(false);
      } catch {
        setError("Failed to update profile. Please try again.");
      }
    },
    [refetchCaregiver]
  );

  // Show loading state while data is being fetched
  if (caregiverLoading || eldersLoading) {
    return <PageLoader loading={true} pageType="profile" />;
  }

  if (!caregiverDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    bio: caregiverDetails.bio ?? "",
    profile_picture: caregiverDetails.profile_picture ?? null,
    street_address: caregiverDetails.street_address ?? "",
    postal_code: caregiverDetails.postal_code ?? "",
    unit_number: caregiverDetails.unit_number ?? "",
    longitude: caregiverDetails.longitude ?? undefined,
    latitude: caregiverDetails.latitude ?? undefined,
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

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getAppointmentsForDay = (day: number) => {
    if (!appointments) return [];
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.startDateTime);
      return apptDate.toDateString() === date.toDateString();
    });
  };

  const navigateToMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectedDateAppointments =
    viewDate && appointments
      ? appointments.filter(
          (appointment) =>
            new Date(appointment.startDateTime).toDateString() ===
            viewDate.toDateString()
        )
      : [];

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 py-8">
        {/* Edit Form Section */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Edit Profile
            </h3>
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            <CaregiverForm
              defaultValues={formDefaults}
              onSubmit={handleSubmit}
              submitLabel="Update Profile"
            />
          </div>
        )}

        {/* Profile Overview Section */}
        {!isEditing && (
          <>
            {/* Profile Header Section */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-start gap-8">
                {/* Profile Picture */}
                {caregiverDetails.profile_picture ? (
                  <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                    <img
                      src={caregiverDetails.profile_picture}
                      alt={`${caregiverDetails.name}'s profile picture`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg flex-shrink-0">
                    {getInitials(caregiverDetails.name)}
                  </div>
                )}

                {/* Profile Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {caregiverDetails.name}
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 mb-4">
                    Caregiver based in{" "}
                    {caregiverDetails.street_address
                      ? "Singapore"
                      : "your location"}
                  </p>

                  {/* Bio */}
                  {caregiverDetails.bio && (
                    <p className="text-gray-700 mb-6 max-w-2xl">
                      {caregiverDetails.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg"
                    >
                      Edit Profile
                    </Button>
                  </div>

                  {/* Statistics */}
                  <div className="flex gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Elders in Care</span>
                      <span className="font-semibold text-gray-900">
                        {elderDetails?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Age</span>
                      <span className="font-semibold text-gray-900">
                        {caregiverDetails.date_of_birth
                          ? getAge(caregiverDetails.date_of_birth)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(caregiverDetails.created_at).split(" ")[2]}
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
                    id: "elders",
                    label: "My Elders",
                    count: elderDetails?.length || 0,
                  },
                  { id: "calendar", label: "My Calendar", count: 0 },
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
            {activeTab === "elders" && (
              <div className="space-y-8">
                {/* Elders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {elderDetails && elderDetails.length > 0 ? (
                    elderDetails.map((elder) => (
                      <div
                        key={elder.id}
                        onClick={() => navigate(`/elder/${elder.id}/profile`)}
                        className="bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition-colors cursor-pointer group"
                      >
                        {/* Elder Preview */}
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-xl font-semibold shadow-sm">
                            {getInitials(elder.name)}
                          </div>
                        </div>

                        {/* Elder Info */}
                        <div className="text-center mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {elder.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {elder.date_of_birth
                              ? getAge(elder.date_of_birth)
                              : "N/A"}{" "}
                            years old • {elder.gender}
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
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Elders Yet
                      </h4>
                      <p className="text-gray-600 mb-6">
                        Start by adding your first elder to begin managing their
                        care.
                      </p>
                      <Button
                        onClick={() => navigate("/elder/new")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Your First Elder
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add Elder Card */}
                {elderDetails && elderDetails.length > 0 && (
                  <div
                    onClick={() => navigate("/elder/new")}
                    className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Add New Elder</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "calendar" && (
              <div className="space-y-6">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToMonth("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h4 className="text-base font-semibold text-gray-900">
                      {currentDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToMonth("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="text-sm"
                    >
                      Today
                    </Button>
                    <Button
                      onClick={() => setIsImportModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Import Your Calendar
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                {elderDetails && elderDetails.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-4 text-center text-sm font-medium text-gray-600"
                          >
                            {day}
                          </div>
                        )
                      )}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {(() => {
                        const daysInMonth = getDaysInMonth(currentDate);
                        const firstDay = getFirstDayOfMonth(currentDate);
                        const cells = [];

                        // Empty cells for days before the first day of the month
                        for (let i = 0; i < firstDay; i++) {
                          cells.push(
                            <div
                              key={`empty-${i}`}
                              className="p-4 border-r border-b border-gray-100 min-h-[120px]"
                            />
                          );
                        }

                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dayAppointments = getAppointmentsForDay(day);
                          const isCurrentDay = isToday(day);

                          cells.push(
                            <div
                              key={day}
                              className={`p-4 border-r border-b border-gray-100 min-h-[120px] transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] hover:z-10 relative cursor-pointer`}
                              onClick={() => {
                                setViewDate(
                                  new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth(),
                                    day
                                  )
                                );
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className={`text-sm font-medium ${
                                    isCurrentDay
                                      ? "text-red-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {isCurrentDay ? (
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-semibold">
                                        {day}
                                      </span>
                                    </div>
                                  ) : (
                                    day
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1">
                                {dayAppointments
                                  .slice(0, 3)
                                  .map((appt, index) => (
                                    <div
                                      key={index}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors duration-150"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAppointment(appt);
                                        setViewDate(
                                          new Date(
                                            currentDate.getFullYear(),
                                            currentDate.getMonth(),
                                            day
                                          )
                                        );
                                        setSheetView("details");
                                      }}
                                    >
                                      {new Date(
                                        appt.startDateTime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      {appt.name}
                                    </div>
                                  ))}
                                {dayAppointments.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayAppointments.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return cells;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Elders to Show Calendar
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Add an elder to start viewing their appointments and
                      activities.
                    </p>
                    <Button
                      onClick={() => navigate("/elder/new")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Your First Elder
                    </Button>
                  </div>
                )}

                {/* Upcoming Appointments */}
                {appointments && appointments.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Upcoming Appointments
                    </h4>
                    <div className="space-y-3">
                      {appointments
                        .filter(
                          (appt) => new Date(appt.startDateTime) > new Date()
                        )
                        .sort(
                          (a, b) =>
                            new Date(a.startDateTime).getTime() -
                            new Date(b.startDateTime).getTime()
                        )
                        .slice(0, 5)
                        .map((appt, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/calendar?date=${new Date(
                                  appt.startDateTime
                                ).toISOString()}`
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {appt.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(
                                    appt.startDateTime
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    appt.startDateTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sheet for Day View */}
      <Sheet
        open={!!viewDate}
        onOpenChange={(open) => {
          if (!open) {
            setViewDate(null);
            setSheetView("dayview");
          }
        }}
      >
        <SheetContent
          side="right"
          className="!w-full sm:!w-[600px] max-w-full p-0 overflow-hidden"
        >
          <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
            <div className="grid grid-cols-3 items-center py-4 px-6">
              <div className="flex justify-start">
                {!(sheetView == "dayview") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSheetView("dayview")}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex justify-center font-semibold text-slate-900">
                {sheetView == "dayview" && viewDate?.toDateString()}
                {sheetView == "details" && "Details"}
                {sheetView == "form" && "Create"}
                {sheetView == "update" && "Update"}
              </div>
              <div className="flex justify-end">
                {sheetView == "dayview" &&
                  elderDetails &&
                  elderDetails.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSheetView("form")}
                      className="bg-white hover:bg-slate-50"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Add Appointment
                    </Button>
                  )}

                {sheetView == "details" && selectedAppointment && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSheetView("update")}
                      variant="outline"
                      className="bg-white hover:bg-slate-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-white hover:bg-slate-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Appointment</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this appointment?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <Button
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={async () => {
                              handleDeleteAppointment({
                                elder_id: selectedAppointment.elder_id,
                                appt_id: selectedAppointment.appt_id,
                              });
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-full overflow-y-auto p-6">
            {sheetView == "dayview" && (
              <DayView
                date={viewDate!}
                appointments={selectedDateAppointments}
                onSelect={(appt) => {
                  setSelectedAppointment(appt);
                  setSheetView("details");
                }}
              />
            )}

            {sheetView == "form" && elderDetails && elderDetails.length > 0 && (
              <AppointmentForm
                selectedDate={viewDate!}
                elder_id={elderDetails[0].id}
                elder_name={elderDetails[0].name}
                onSubmit={handleAppointmentSubmit}
              />
            )}

            {sheetView == "details" && selectedAppointment?.appt_id && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedAppointment.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Time</div>
                        <div className="font-medium text-gray-900">
                          {new Date(
                            selectedAppointment.startDateTime
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            selectedAppointment.startDateTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    {selectedAppointment.details && (
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 text-gray-400 mt-0.5">📝</div>
                        <div>
                          <div className="text-sm text-gray-600">Details</div>
                          <div className="font-medium text-gray-900">
                            {selectedAppointment.details}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.loc && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Location</div>
                          <div className="font-medium text-gray-900">
                            {selectedAppointment.loc}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {sheetView == "update" && selectedAppointment?.appt_id && (
              <AppointmentForm
                selectedDate={viewDate!}
                elder_id={selectedAppointment.elder_id}
                elder_name={
                  elderDetails?.find(
                    (e) => e.id === selectedAppointment.elder_id
                  )?.name || ""
                }
                onSubmit={handleUpdateSubmit}
                defaultValues={selectedAppointment}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Backdrop blur overlay when sheet is open */}
      {!!viewDate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 pointer-events-none" />
      )}

      {/* Import Calendar Modal */}
      <GlassmorphicModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Your Schedule"
        description="Upload your calendar file to import appointments into your schedule."
      >
        <IcsImport onImportComplete={refetchAppointments} />
      </GlassmorphicModal>
    </div>
  );
}
