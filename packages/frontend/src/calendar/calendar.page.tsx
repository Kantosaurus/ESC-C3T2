import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  Edit,
  Trash2,
  ArrowLeft,
  CalendarPlus,
} from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/ui/calendardayview";
import { useNavigate, useParams } from "react-router-dom";
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
} from "./use-appointment";
import AppointmentDetailsPage from "./appointment.details";
import UpdateAppointmentForm from "./update.appointment.form";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import CalendarBar from "./calendarbar";

export default function Calendarview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [currDate, setCurrDate] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const { elderDetails } = useEldersDetails();
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [sheetView, setSheetView] = useState<
    "dayview" | "details" | "form" | "update"
  >("dayview");

  //handlers
  const { appointments, refetch } = useGetAppointments(
    selectedElder?.id ?? null
  );

  const addAppointment = useCreateAppointment();
  const handleAppointmentSubmit = async (values: AppointmentFormType) => {
    try {
      await addAppointment(values);
      await refetch();
      setViewDate(null);
      setSheetView("dayview");
      if (selectedElder) {
        navigate(`/calendar/${selectedElder.id}`, { replace: true });
      } else {
        navigate("/calendar", { replace: true });
      }
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
      if (selectedElder) {
        navigate(`/calendar/${selectedElder.id}`, { replace: true });
      } else {
        navigate("/calendar", { replace: true });
      }
      toast.success("Appointment deleted");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      const axiosErr = error as AxiosError<{ error: string }>;
      const message = axiosErr.response?.data?.error ?? "Unexpected error";
      toast.error(message);
    }
  };

  const showAppointmentDetails = (appointment: Appointment) => {
    const elder = elderDetails?.find((e) => e.id === appointment.elder_id);
    if (elder) {
      setSelectedElder(elder);
      setSelectedAppointment(appointment);
      setViewDate(new Date(appointment.startDateTime));
      setSheetView("details");
      navigate(`/calendar/${elder.id}/${appointment.appt_id}`, {
        replace: true,
      });
    }
  };

  //render
  useEffect(() => {
    if (elderDetails && elderDetails.length > 0) {
      setSelectedElder(elderDetails[0]);
    }
  }, [elderDetails]);

  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();

  //url things
  const navigate = useNavigate();
  const { elder_id, appt_id } = useParams<{
    elder_id?: string;
    appt_id?: string;
  }>();

  //if url has elder id only
  useEffect(() => {
    if (elder_id && elderDetails) {
      const urlElder = elderDetails.find(
        (e) => e.id === parseInt(elder_id, 10)
      );
      if (urlElder) {
        setSelectedElder(urlElder);
      }
    }
  }, [elder_id, elderDetails]);

  //if url has elder id and appt id
  useEffect(() => {
    if (elder_id && elderDetails && appt_id && appointments) {
      const urlAppointment = appointments.find(
        (a) => a.appt_id === parseInt(appt_id, 10)
      );
      if (urlAppointment) {
        setSelectedAppointment(urlAppointment);
        setViewDate(new Date(urlAppointment.startDateTime));
        setSheetView("details");
      }
    }
  }, [elder_id, elderDetails, appt_id, appointments]);

  //update url when elder selected
  const selectElder = (elder: Elder) => {
    setSelectedElder(elder);
    navigate(`/calendar/${elder.id}`, { replace: true });
  };

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
  for (let i = 0; i < 42 - firstDay - daysInMonth; i++) {
    calCells.push(<CalendarCell variant="empty" key={`trailing-empty-${i}`} />);
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
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">
                  Calendar
                </h1>
                <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
                <span className="text-slate-600">for</span>
                <Select
                  value={selectedElder?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const elderObj = elderDetails?.find(
                      (elder) => elder.id.toString() === value
                    );
                    if (elderObj) {
                      selectElder(elderObj);
                    }
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
            <div className="flex sm:gap-1 items-center">
              <Button
                data-testid="prev-month-button"
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-9 w-4 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <div className="relative w-[120px] sm:w-[130px] scale-80 sm:scale-100 flex items-center justify-center">
                <MiniCalendar
                  selected={currDate}
                  onSelect={(date) => setCurrDate(date)}
                />
              </div>

              <Button
                data-testid="next-month-button"
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-9 w-4 rounded-lg hover:bg-slate-100"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Right Section */}
            <div className="ml-auto">
              <CalendarBar
                selectedElder={selectedElder}
                goToToday={goToToday}
              ></CalendarBar>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 p-2 overflow-hidden">
        <div className="bg-white h-full flex flex-col rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
          <div className="grid grid-cols-7 flex-1 h-full [grid-auto-rows:1fr] gap-px md:gap-0">
            {calCells}
          </div>
        </div>
      </main>

      {/* Sheet for Day View */}
      <Sheet
        open={!!viewDate && !!selectedElder}
        onOpenChange={(open) => {
          if (!open) {
            setViewDate(null);
            setSheetView("dayview");
            setSelectedAppointment(null);
            if (selectedElder) {
              navigate(`/calendar/${selectedElder.id}`, { replace: true });
            } else {
              navigate("/calendar", { replace: true });
            }
          }
        }}
      >
        <SheetContent
          side="right"
          className="!w-full sm:!w-[600px] max-w-full p-0 overflow-hidden"
        >
          <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
            <div className="justify-between flex items-center py-4 px-6">
              <div className="flex justify-start">
                {sheetView == "dayview" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewDate(null);
                      setSelectedAppointment(null);
                    }}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
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
                          <DialogTitle className="max-w-[400px] truncate">
                            Delete {selectedAppointment.name}?
                          </DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the appointment
                          </DialogDescription>
                        </DialogHeader>
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
                viewDateString={viewDate?.toDateString()}
                date={viewDate!}
                appointments={selectedDateAppointments}
                onSelect={(appt) => {
                  showAppointmentDetails(appt);
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
