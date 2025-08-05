import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  Edit,
  Trash2,
  ArrowLeft,
  CalendarPlus,
  Inbox,
  Search,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/ui/calendardayview";
import { useNavigate } from "react-router-dom";
import type { Appointment } from "@carely/core";
import { MiniCalendar } from "@/components/ui/calendar-mini";
import AppNavbar from "@/nav/navbar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Sheet, SheetContent } from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useEldersDetails } from "@/elder/use-elder-details";
import type { Elder } from "@carely/core";
import { AppointmentForm, type AppointmentFormType } from "./appointment.form";
import { PageLoader } from "@/components/ui/page-loader";
import {
  useCreateAppointment,
  useGetAppointments,
  useDeleteAppointment,
  useUpdateAppointment,
  useGetPendingAppointments,
} from "./use-appointment";
import AppointmentDetailsPage from "./appointment.details";
import UpdateAppointmentForm from "./update.appointment.form";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";

export default function Calendarview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [currDate, setCurrDate] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const { elderDetails, isLoading: eldersLoading } = useEldersDetails();
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [sheetView, setSheetView] = useState<
    "dayview" | "details" | "form" | "update"
  >("dayview");
  const [showPending, setShowPending] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  //handlers
  const { appointments, refetch } = useGetAppointments(
    selectedElder?.id ?? null
  );
  const { pending, refetchPending } = useGetPendingAppointments();
  useEffect(() => {
    if (pending) {
      setPendingAppointments(pending);
    }
  }, [pending]);

  const addAppointment = useCreateAppointment();
  const handleAppointmentSubmit = async (values: AppointmentFormType) => {
    try {
      await addAppointment(values);
      await refetch();
      await refetchPending();
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
      await refetch();
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
      await refetch();
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

  const findElder = (id: number) =>
    elderDetails?.find((elder) => elder.id === id);

  //render
  useEffect(() => {
    if (elderDetails && elderDetails.length > 0) {
      setSelectedElder(elderDetails[0]);
    }
  }, [elderDetails]);

  useEffect(() => {
    if (!appointments || searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = appointments.filter(
      (appointment) =>
        appointment.name.toLowerCase().includes(query) ||
        appointment.details?.toLowerCase().includes(query) ||
        appointment.loc?.toLowerCase().includes(query) ||
        findElder(appointment.elder_id)?.name.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, appointments]);

  const navigate = useNavigate();

  // Show loading state while data is being fetched
  if (eldersLoading) {
    return <PageLoader loading={true} pageType="calendar" />;
  }

  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();

  const goToToday = () => {
    setCurrDate(new Date());
  };

  const calCells = [];

  for (let i = 0; i < firstDay; i++) {
    calCells.push(<CalendarCell variant="empty" key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    const cellDate = new Date(year, month, day);

    const dayAppointments = (appointments ?? []).filter(
      (appt) =>
        new Date(appt.startDateTime).toDateString() === cellDate.toDateString()
    );
    dayAppointments.sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
    );

    calCells.push(
      <CalendarCell
        variant={isToday ? "today" : "default"}
        hasEvent={dayAppointments.length > 0}
        key={day}
        onClick={() => {
          setViewDate(cellDate);
        }}
        eventLabel={dayAppointments.map(
          (appt) =>
            `${new Date(appt.startDateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} ${appt.name}`
        )}
      >
        {day}
      </CalendarCell>
    );
  }
  const prevMonth = () => setCurrDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrDate(new Date(year, month + 1, 1));

  const selectedDateAppointments =
    viewDate && appointments
      ? appointments.filter(
          (appointment) =>
            new Date(appointment.startDateTime).toDateString() ===
            viewDate.toDateString()
        )
      : [];
  if (!selectedElder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <AppNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Elders Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to add an elder profile before managing appointments.
              </p>
            </div>
            <Button
              onClick={() => navigate("/elder/new")}
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <User className="h-4 w-4" />
              Add Your First Elder
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <AppNavbar />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage appointments and schedules
              </p>
            </div>
          </div>

          {/* Elder Selection */}
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-gray-400">for</span>
            <Select
              value={selectedElder?.id?.toString() || ""}
              onValueChange={(value) => {
                const elderObj = elderDetails?.find(
                  (elder) => elder.id.toString() === value
                );
                setSelectedElder(elderObj || null);
              }}
            >
              <SelectTrigger className="w-auto border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white font-medium hover:bg-white dark:hover:bg-gray-800 px-4 py-2 shadow-sm">
                <SelectValue placeholder="Choose elder..." />
              </SelectTrigger>
              <SelectContent>
                {elderDetails?.map((elder) => (
                  <SelectItem key={elder.id} value={elder.id.toString()}>
                    {elder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between">
          {/* Calendar Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <MiniCalendar
              selected={currDate}
              onSelect={(date) => setCurrDate(date)}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
            >
              Today
            </Button>

            {/* Expandable Search */}
            <div className="relative">
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out origin-right",
                  isSearchExpanded ? "w-64" : "w-10"
                )}
                onMouseEnter={() => setIsSearchExpanded(true)}
                onMouseLeave={() => {
                  if (!searchQuery) {
                    setIsSearchExpanded(false);
                  }
                }}
              >
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => {
                      if (!searchQuery) {
                        setIsSearchExpanded(false);
                      }
                    }}
                    className={cn(
                      "pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all duration-300",
                      isSearchExpanded ? "w-full opacity-100" : "w-10 opacity-0"
                    )}
                    style={{
                      width: isSearchExpanded ? "100%" : "40px",
                      opacity: isSearchExpanded ? 1 : 0,
                    }}
                  />
                  {!isSearchExpanded && (
                    <div className="absolute inset-0 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer shadow-sm">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && isSearchExpanded && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl z-50 overflow-hidden">
                  <div className="p-3 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Search Results ({searchResults.length})
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.startDateTime}-${result.name}`}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => {
                          setSelectedAppointment(result);
                          setSearchQuery("");
                          setViewDate(new Date(result.startDateTime));
                          setSheetView("details");
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {result.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                result.startDateTime
                              ).toLocaleDateString()}{" "}
                              –{" "}
                              {new Date(
                                result.startDateTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pending Appointments */}
            <div className="relative">
              <Button
                onClick={() => {
                  setShowPending((prev) => !prev);
                  refetchPending();
                }}
                variant="outline"
                className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Inbox className="w-4 h-4 mr-2" />
                Pending
                {pendingAppointments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingAppointments.length}
                  </span>
                )}
              </Button>

              {showPending && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl z-50 overflow-hidden">
                  {pendingAppointments.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-3 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Pending Appointments ({pendingAppointments.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingAppointments.map((result) => (
                          <div
                            key={result.appt_id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedAppointment(result);
                              setSelectedElder(
                                findElder(result.elder_id) || null
                              );
                              setSearchQuery("");
                              setViewDate(new Date(result.startDateTime));
                              setSheetView("details");
                              setShowPending(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                  {result.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  for {findElder(result.elder_id)?.name}
                                </div>
                                {result.startDateTime && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(
                                      result.startDateTime
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        No pending appointments
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        All appointments are accepted
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-soft overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            {days.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-4 px-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 min-h-[600px]">{calCells}</div>
        </div>
      </div>

      {/* Sheet for Day View */}
      <Sheet
        open={!!viewDate && !!selectedElder}
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
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="grid grid-cols-3 items-center py-4 px-6">
              <div className="flex justify-start">
                {!(sheetView == "dayview") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSheetView("dayview")}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex justify-center font-semibold text-gray-900 dark:text-white">
                {sheetView == "dayview" && viewDate?.toDateString()}
                {sheetView == "details" && "Details"}
                {sheetView == "form" && "Create"}
                {sheetView == "update" && "Update"}
              </div>
              <div className="flex justify-end">
                {sheetView == "dayview" && (
                  <Button
                    variant="outline"
                    onClick={() => setSheetView("form")}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Add Appointment
                  </Button>
                )}

                {sheetView == "details" && selectedAppointment && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Delete {selectedAppointment.name}?
                          </DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the appointment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <Button
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={async () => {
                              if (!selectedElder) return;
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
                    <Button
                      onClick={() => setSheetView("update")}
                      variant="outline"
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
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

            {sheetView == "form" && (
              <AppointmentForm
                selectedDate={viewDate!}
                elder_id={selectedElder!.id}
                elder_name={selectedElder!.name}
                onSubmit={handleAppointmentSubmit}
              />
            )}

            {sheetView == "details" && selectedAppointment?.appt_id && (
              <AppointmentDetailsPage
                elder={selectedElder}
                appt_id={selectedAppointment.appt_id}
              />
            )}
            {sheetView == "update" && selectedAppointment?.appt_id && (
              <UpdateAppointmentForm
                elder={selectedElder}
                appt={selectedAppointment}
                onSubmit={handleUpdateSubmit}
              ></UpdateAppointmentForm>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Backdrop blur overlay when sheet is open */}
      {!!viewDate && !!selectedElder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 pointer-events-none" />
      )}
    </div>
  );
}
