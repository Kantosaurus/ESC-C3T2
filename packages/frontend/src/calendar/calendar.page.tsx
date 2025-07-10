import { useEffect, useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { elderDetails, error, isLoading } = useEldersDetails();
  const deleteAppointment = useDeleteAppointment();

  useEffect(() => {
    // Set the initial selected elder to the first elder if available
    if (elderDetails && elderDetails.length > 0) {
      setSelectedElder(elderDetails[0]);
    }
  }, [elderDetails]);

  const [showForm, setShowForm] = useState(false);

  const {
    appointments,
    error: appointmentsError,
    isLoading: appointmentsLoading,
    refetch,
  } = useGetAppointments(selectedElder?.id || null);

  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();

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

    const hasAppointments = appointments?.some((appointment) => {
      const appointmentDate = new Date(appointment.startDateTime);
      return appointmentDate.toDateString() === cellDate.toDateString();
    });

    calCells.push(
      <CalendarCell
        variant={isToday ? "today" : "default"}
        hasEvent={hasAppointments ? true : false}
        key={day}
        onClick={() => {
          setViewDate(cellDate);
          setShowForm(false);
        }}
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
      ? appointments.filter((appointment) => {
          const appointmentDate = new Date(appointment.startDateTime);
          return appointmentDate.toDateString() === viewDate.toDateString();
        })
      : [];

  return (
    <>
      <section className="bg-blue-100 text-blue-800">
        <div className="mx-auto max-w-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">🗓️ Calendar</h1>
          <p>View and add appointments here</p>

          <div className="mt-6">
            <label
              htmlFor="elder-select"
              className="block text-sm font-medium mb-2"
            >
              Select Elder:
            </label>
            {isLoading ? (
              <div className="w-full max-w-xs bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2">
                Loading elders...
              </div>
            ) : error ? (
              <div className="w-full max-w-xs bg-red-50 text-red-600 border border-red-300 rounded-md px-3 py-2">
                Error: {error}
              </div>
            ) : (
              <Select
                value={selectedElder?.id?.toString() || ""}
                onValueChange={(value) => {
                  const elderObj = elderDetails?.find(
                    (elder) => elder.id.toString() === value
                  );
                  setSelectedElder(elderObj || null);
                }}
              >
                <SelectTrigger className="w-full max-w-xs bg-white text-gray-900">
                  <SelectValue placeholder="Choose an elder..." />
                </SelectTrigger>
                <SelectContent>
                  {elderDetails?.map((elder) => (
                    <SelectItem key={elder.id} value={elder.id.toString()}>
                      {elder.name} (ID: {elder.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </section>

      <section className="p-8 mx-auto max-w-2xl">
        <div style={{ maxWidth: "800px", margin: "20px auto" }}>
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={prevMonth}>
              <ChevronLeftIcon />
            </Button>
            <h2>
              {currDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button variant="outline" onClick={nextMonth}>
              <ChevronRightIcon />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-2">
            {days.map((day) => (
              <div key={day} className="font-semibold text-center">
                {day}
              </div>
            ))}
            {calCells}
          </div>

          {viewDate && selectedElder && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">
                Selected Date: {viewDate.toDateString()}
              </h3>

              {appointmentsLoading && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  Loading appointments...
                </div>
              )}

              {appointmentsError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                  Error loading appointments: {appointmentsError}
                </div>
              )}

              {selectedDateAppointments.map((appointment, index) => {
                const startTime = new Date(
                  appointment.startDateTime
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTime = new Date(
                  appointment.endDateTime
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const handleDelete = async () => {
                  try {
                    await deleteAppointment({
                      elder_id: selectedElder.id,
                      startDateTime: appointment.startDateTime,
                      endDateTime: appointment.endDateTime,
                    });
                    await refetch(); // Refresh the list
                  } catch (error) {
                    console.error("Failed to delete appointment:", error);
                  }
                };

                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">
                        {startTime} - {endTime}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.details}
                      </div>
                    </div>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </div>
                );
              })}

              {showForm && viewDate && selectedElder && (
                <AppointmentForm
                  selectedDate={viewDate}
                  elder_id={selectedElder.id}
                  elder_name={selectedElder.name}
                  onSubmit={handleAppointmentSubmit}
                />
              )}

              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  Add Appointment
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
