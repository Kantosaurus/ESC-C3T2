import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  Edit,
  Trash2,
  ArrowLeft,
  CalendarPlus,
  Inbox,
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
} from "./use-appointment";
import AppointmentDetailsPage from "./appointment.details";
import UpdateAppointmentForm from "./update.appointment.form";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export default function Calendarview() {
  const days = ["Mon", "Tues", "Weds", "Thurs", "Fri", "Sat", "Sun"];
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
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">
          <Button variant="outline" onClick={() => navigate("/elder/new")}>
            Please add an elder here first
          </Button>
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 py-2 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            className="text-gray-600 hover:text-gray-800 text-2xl"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">Dashboard</h1>

          <div className="ml-4 flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="w-[140px] text-center relative">
              <MiniCalendar
                selected={currDate}
                onSelect={(date) => setCurrDate(date)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="mt-2 text-lg font-medium">Appointments for</span>
          <div className="mt-2">
            <Select
              value={selectedElder?.id?.toString() || ""}
              onValueChange={(value) => {
                const elderObj = elderDetails?.find(
                  (elder) => elder.id.toString() === value
                );
                setSelectedElder(elderObj || null);
              }}
            >
              <SelectTrigger className="text-lg font-medium">
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
        <div className="relative">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowPending((prev) => !prev);
                refetchPending();
              }}
              variant="outline"
            >
              <Inbox></Inbox> {pendingAppointments.length > 0 && "!"}
            </Button>

            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          <div className="relative -translate-x-64">
            {showPending && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg border border-gray-200 rounded-lg z-50 overflow-hidden">
                {pendingAppointments.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">
                        Pending Appointments ({pendingAppointments.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {pendingAppointments.map((result) => (
                        <div
                          key={result.appt_id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out"
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
                          <div className="flex flex-col space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {result.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              for {findElder(result.elder_id)?.name}
                            </div>
                            {result.startDateTime && (
                              <div className="text-xs text-gray-500">
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
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div className="text-gray-400 text-sm">
                      No pending appointments
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      All appointments are accepted
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute right-0 mt-1 w-64 bg-white shadow-md border rounded z-50">
              {searchResults.map((result) => (
                <div
                  key={`${result.startDateTime}-${result.name}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedAppointment(result);
                    setSearchQuery("");
                    setViewDate(new Date(result.startDateTime));
                    setSheetView("details");
                  }}
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(result.startDateTime).toLocaleDateString()} –{" "}
                    {new Date(result.startDateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="p-6 w-full flex-grow flex flex-col overflow-visible">
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="grid grid-cols-7 h-10 bg-gray-200 border border-gray-300">
            {days.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2 border-r border-b border-gray-300"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-grow bg-gray-200 border border-gray-300">
            {calCells}
          </div>
        </div>
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
            className="!w-full sm:!w-[600px] max-w-full p-6 overflow-y-auto"
          >
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10 mb-1">
              <div className="grid grid-cols-3 items-center py-2">
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
                <div className="flex justify-center font-semibold">
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
                    >
                      <CalendarPlus />
                      Add Appointment
                    </Button>
                  )}

                  {sheetView == "details" && selectedAppointment && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Trash2 />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Delete {selectedAppointment.name}?
                            </DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will
                              permanently delete the appointment
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
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-11/12 overflow-y-auto">
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
      </main>
    </div>
  );
}
