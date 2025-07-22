import { useEffect, useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/ui/calendardayview";
import { useNavigate } from "react-router-dom";
import type { Appointment } from "@carely/core";
import { MonthSelector } from "@/components/ui/calendarmonthselector";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEldersDetails } from "@/elder/use-elder-details";
import type { Elder } from "@carely/core";
import { AppointmentForm, type AppointmentFormType } from "./appointment.form";
import {
  useCreateAppointment,
  useGetAppointments,
  useDeleteAppointment,
} from "./use-appointment";

export default function Calendarview() {
  const days = ["Mon", "Tues", "Weds", "Thurs", "Fri", "Sat", "Sun"];
  const [currDate, setCurrDate] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const { elderDetails } = useEldersDetails();
  const deleteAppointment = useDeleteAppointment();
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);

  useEffect(() => {
    if (elderDetails && elderDetails.length > 0) {
      setSelectedElder(elderDetails[0]);
    }
  }, [elderDetails]);

  const [showForm, setShowForm] = useState(false);

  const { appointments, refetch } = useGetAppointments(selectedElder?.id ?? -1);

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
          setShowForm(false);
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

  const addAppointment = useCreateAppointment();

  const handleAppointmentSubmit = async (values: AppointmentFormType) => {
    try {
      await addAppointment(values);
      await refetch();
      setShowForm(false);
      setViewDate(null);
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };
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
        <p className="text-gray-500 text-lg">Loading elder data...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 py-2 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            className="text-gray-600 hover:text-gray-800 text-2xl"
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold">Calendar</h1>

          <div className="ml-4 flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="w-[140px] text-center relative">
              <MonthSelector
                selected={currDate}
                onSelect={(date) => setCurrDate(date)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
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

          {searchResults.length > 0 && (
            <div className="absolute right-0 mt-1 w-64 bg-white shadow-md border rounded z-50">
              {searchResults.map((result) => (
                <div
                  key={`${result.startDateTime}-${result.name}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedAppointment(result);
                    setSearchQuery("");
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
            if (!open) setViewDate(null);
          }}
        >
          <SheetContent
            side="right"
            className="!w-full sm:!w-[600px] max-w-full p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-start mt-6 mb-4 gap-4">
              <SheetHeader>
                <SheetTitle className="text-lg">
                  Appointments on {viewDate?.toDateString()}
                </SheetTitle>
              </SheetHeader>

              <div>
                {!showForm && (
                  <Button onClick={() => setShowForm(true)}>
                    Add Appointment
                  </Button>
                )}
              </div>
            </div>
            <div className="h-[800px] overflow-y-auto border rounded shadow-inner">
              <DayView
                date={viewDate!}
                appointments={selectedDateAppointments}
                onSelect={(appt) => setSelectedAppointment(appt)}
              />
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogContent className="p-6 max-w-md">
                <DialogHeader>
                  <DialogTitle>New Appointment</DialogTitle>
                </DialogHeader>

                <AppointmentForm
                  selectedDate={viewDate!}
                  elder_id={selectedElder!.id}
                  elder_name={selectedElder!.name}
                  onSubmit={handleAppointmentSubmit}
                />
              </DialogContent>
            </Dialog>
          </SheetContent>
        </Sheet>

        {selectedAppointment && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-6 w-full max-w-md pointer-events-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Appointment Details</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-500 hover:text-gray-700 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {selectedAppointment.name}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    selectedAppointment.startDateTime
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(
                    selectedAppointment.startDateTime
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(selectedAppointment.endDateTime).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
                <div>
                  <strong>Details:</strong>
                  <div className="max-h-32 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words mt-1 border border-gray-200 p-2 rounded bg-gray-50">
                    {selectedAppointment.details}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    //THANK YOU RYAN YOU ARE SO COOL
                    alert("RYAN ALL U BUDDY");
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={async () => {
                    if (!selectedElder) return;
                    await deleteAppointment({
                      elder_id: selectedElder.id,
                      startDateTime: selectedAppointment.startDateTime,
                      endDateTime: selectedAppointment.endDateTime,
                    });
                    await refetch();
                    setSelectedAppointment(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetTrigger asChild>
          <div className="hidden" />
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-4">
          <SheetHeader>
            <SheetTitle>Options</SheetTitle>
          </SheetHeader>

          <div className="space-y-2 mt-4">
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button
              className="w-full"
              onClick={() => alert("THIS DOES NOTHING YET LOL")}
            >
              Accept/Deny invites
            </Button>

            <div className="mb-4 mt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Select Elder
              </h3>
              <Select
                value={selectedElder?.id?.toString() || ""}
                onValueChange={(value) => {
                  const elderObj = elderDetails?.find(
                    (elder) => elder.id.toString() === value
                  );
                  setSelectedElder(elderObj || null);
                }}
              >
                <SelectTrigger className="bg-white text-gray-900 w-full">
                  <SelectValue placeholder="Choose elder..." />
                </SelectTrigger>
                <SelectContent>
                  {elderDetails?.map((elder) => (
                    <SelectItem key={elder.id} value={elder.id.toString()}>
                      {elder.name} (ID: {elder.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
