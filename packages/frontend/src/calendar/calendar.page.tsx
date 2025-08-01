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
  Download,
} from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/ui/calendardayview";
import { useNavigate } from "react-router-dom";
import type { Appointment } from "@carely/core";
import { MiniCalendar } from "@/components/ui/calendar-mini";

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
import {
  useCreateAppointment,
  useGetAppointments,
  useDeleteAppointment,
  useUpdateAppointment,
  useGetPendingAppointments,
  useGetDeclinedAppointments,
} from "./use-appointment";
import AppointmentDetailsPage from "./appointment.details";
import UpdateAppointmentForm from "./update.appointment.form";
import useCreateIcsFile from "./exportics";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";

export default function Calendarview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [currDate, setCurrDate] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const { elderDetails } = useEldersDetails();
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

  //handlers
  const { appointments, refetch } = useGetAppointments(
    selectedElder?.id ?? null
  );

  const { triggerDownload } = useCreateIcsFile(appointments);

  const { declined } = useGetDeclinedAppointments(selectedElder?.id ?? null);

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
      (appt) =>
        appt.name.toLowerCase().includes(query) ||
        (appt.details?.toLowerCase().includes(query) ?? false)
    );
    setSearchResults(filtered);
  }, [searchQuery, appointments]);

  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
            <CalendarPlus className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg font-medium">No elders found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/elder/new")}
            className="bg-white hover:bg-slate-50"
          >
            Add your first elder
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <header
        className={cn(
          "bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-20 transition-all duration-300",
          !!viewDate && !!selectedElder && "backdrop-blur-xl bg-white/30"
        )}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <button
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900">
                  Calendar
                </h1>
                <div className="h-4 w-px bg-slate-300"></div>
                <span className="text-slate-600">for</span>
                <Select
                  value={selectedElder?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const elderObj = elderDetails?.find(
                      (elder) => elder.id.toString() === value
                    );
                    setSelectedElder(elderObj || null);
                  }}
                >
                  <SelectTrigger className="w-auto border-0 bg-transparent text-slate-900 font-medium hover:bg-slate-100 px-3 py-1">
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

            {/* Center Section - Calendar Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-9 w-9 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <div className="relative">
                <MiniCalendar
                  selected={currDate}
                  onSelect={(date) => setCurrDate(date)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-9 w-9 rounded-lg hover:bg-slate-100"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                {searchResults.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-slate-200 rounded-xl z-50 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-sm font-medium text-slate-900">
                        Search Results ({searchResults.length})
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.startDateTime}-${result.name}`}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                          onClick={() => {
                            setSelectedAppointment(result);
                            setSearchQuery("");
                            setViewDate(new Date(result.startDateTime));
                            setSheetView("details");
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 truncate">
                                {result.name}
                              </div>
                              <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
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
              {selectedElder.id && (
                <Button variant="outline" onClick={() => triggerDownload()}>
                  Export <Download />
                </Button>
              )}
              {/* Pending Appointments */}
              <div className="relative">
                <Button
                  onClick={() => {
                    setShowPending((prev) => !prev);
                    refetchPending();
                  }}
                  variant="outline"
                  className="relative bg-white hover:bg-slate-50 border-slate-200"
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
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-slate-200 rounded-xl z-50 overflow-hidden">
                    {pendingAppointments.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="text-sm font-medium text-slate-900">
                            Pending Appointments ({pendingAppointments.length})
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {pendingAppointments.map((result) => (
                            <div
                              key={result.appt_id}
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
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
                                {declined?.some(
                                  (item) => item.appt_id === result.appt_id
                                ) ? (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                ) : (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 truncate">
                                    {result.name}
                                  </div>
                                  <div className="text-sm text-slate-500 mt-1">
                                    for {findElder(result.elder_id)?.name}
                                  </div>
                                  {result.startDateTime && (
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
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
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-slate-500 text-sm font-medium">
                          No pending appointments
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          All appointments are accepted
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Today Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="bg-white hover:bg-slate-50 border-slate-200"
              >
                Today
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {days.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-slate-600 py-4 px-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 h-full">{calCells}</div>
        </div>
      </main>

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
                {sheetView == "dayview" && (
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-white hover:bg-slate-50"
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
                      className="bg-white hover:bg-slate-50"
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
