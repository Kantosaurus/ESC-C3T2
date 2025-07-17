import { useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { CalendarCell } from "@/components/ui/calendarcells";
import { Button } from "@/components/ui/button";

export default function Calendarview() {
  const days = ["Mon", "Tues", "Weds", "Thurs", "Fri", "Sat", "Sun"];

  const [currDate, setCurrDate] = useState(new Date());

  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); //No. of days in the month
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const calCells = [];
  const today = new Date();

  for (let i = 0; i < firstDay; i++) {
    calCells.push(<CalendarCell variant="empty" key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    calCells.push(
      <CalendarCell variant={isToday ? "today" : "default"} key={day}>
        {day}
      </CalendarCell>
    );
  }

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrDate(newDate);
  };

  return (
    <>
      <section className="bg-teal-100 text-teal-800">
        <div className="mx-auto max-w-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">🗓️ Calendar</h1>
          <p>Manage and view your appointments here</p>
        </div>
      </section>
      <section className="p-8 mx-auto max-w-2xl">
        <div style={{ maxWidth: "800px", margin: "20px auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button variant="outline" onClick={prevMonth}>
              <ChevronLeftIcon />
            </Button>
            <h2 style={{ margin: 0 }}>
              {currDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button variant="outline" onClick={nextMonth}>
              <ChevronRightIcon />
            </Button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
              marginTop: "10px",
            }}
          >
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
            {calCells}
          </div>
        </div>
      </section>
    </>
  );
}
