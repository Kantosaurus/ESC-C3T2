import { useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";
import CalendarForm from "@/components/ui/calendarform";

export default function Calendarview() {
  const days = ["Mon", "Tues", "Weds", "Thurs", "Fri", "Sat", "Sun"];
  const [currDate, setCurrDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<
    { title: string; time: string; date: Date; details?: string }[]
  >([]);

  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();

  const calCells = [];

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(
      (appt) =>
        appt.date.getFullYear() === date.getFullYear() &&
        appt.date.getMonth() === date.getMonth() &&
        appt.date.getDate() === date.getDate()
    );
  };

  for (let i = 0; i < firstDay; i++) {
    calCells.push(<CalendarCell variant="empty" key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    const cellDate = new Date(year, month, day);

    calCells.push(
      <CalendarCell
        variant={isToday ? "today" : "default"}
        interactive
        key={day}
        onClick={() => {
          setViewDate(cellDate);
        }}
      >
        {day}
      </CalendarCell>
    );
  }

  const prevMonth = () => setCurrDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrDate(new Date(year, month + 1, 1));

  return (
    <>
      <section className="bg-blue-100 text-blue-800">
        <div className="mx-auto max-w-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">🗓️ Calendar</h1>
          <p>Manage and view your appointments here</p>
          <Button
            onClick={() => {
              setFormDate(null);
              setShowForm(true);
            }}
            className="mt-4"
          >
            + Add Appointment
          </Button>
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

          {showForm && (
            <CalendarForm
              initialDate={formDate}
              onSave={({ title, time, date, details }) => {
                const apptDate = new Date(`${date}T${time}`);
                setAppointments((prev) => [
                  ...prev,
                  { title, time, date: apptDate, details },
                ]);
                setShowForm(false);
                setViewDate(apptDate);
              }}
              onCancel={() => {
                setFormDate(null);
                setShowForm(false);
              }}
            />
          )}

          {viewDate && (
            <div className="mt-4">
              <h3 className="font-semibold">
                Appointments for {viewDate.toDateString()}
              </h3>
              {getAppointmentsForDate(viewDate).length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {getAppointmentsForDate(viewDate).map((appt, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-100 p-2 rounded"
                    >
                      <div>
                        🕒 {appt.time} — {appt.title}
                        {appt.details && (
                          <div className="text-sm text-gray-600">
                            {appt.details}
                          </div>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormDate(appt.date);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setAppointments((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No appointments for this date.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
