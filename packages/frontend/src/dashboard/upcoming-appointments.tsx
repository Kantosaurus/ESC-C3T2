import Card from "@/components/ui/card";
import { http } from "@/lib/http";
import type { Appointment } from "@carely/core";
import type { AxiosResponse, AxiosError } from "axios";
import { Calendar, MapPin, Pen } from "lucide-react";
import { useEffect, useState } from "react";

const useUpcomingAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError(undefined);
    const controller = new AbortController();

    http()
      .get("/api/dashboard/upcoming-appointments", {
        signal: controller.signal,
      })
      .then(
        (res: AxiosResponse<Appointment[]>) => {
          console.log("Fetched upcoming appointments:", res.data);
          setAppointments(res.data);
        },
        (error: AxiosError) => {
          if (error.name === "CanceledError") {
            console.warn("Request was cancelled:", error);
            return;
          }
          setError(
            "Unexpected error occurred while fetching upcoming appointments"
          );
          console.error("Error fetching upcoming appointments:", error);
        }
      )
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
      setAppointments([]);
      setError(undefined);
    };
  }, []);

  return { appointments, error, isLoading };
};

const renderTimeInfo = (startDateTime: Date, endDateTime: Date) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  // check if its today
  const isToday = start.toDateString() === new Date().toDateString();

  // check if its tomorrow
  const isTomorrow =
    start.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const dateLabel = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : start.toLocaleDateString();

  const timeConfig = {
    hour: "2-digit",
    minute: "2-digit",
  } as const;

  const startTimeLabel = start.toLocaleTimeString([], timeConfig);

  const endTimeLabel = end.toLocaleTimeString([], timeConfig);

  // Check if time is within the same hour
  const isSoon = start.getTime() - Date.now() < 3600000; // less than 1 hour

  return (
    <span className={`text-xs ${isSoon ? "text-red-500" : "text-gray-600"}`}>
      {dateLabel}, {startTimeLabel} - {endTimeLabel}
    </span>
  );
};

export default function UpcomingAppointments({
  elderNames,
}: {
  elderNames?: Record<string, string>;
}) {
  const { appointments, error, isLoading } = useUpcomingAppointments();
  return (
    <div>
      <h2 className="font-semibold flex flex-row items-center mb-3 text-xs text-muted-foreground">
        <Calendar className="inline-block mr-1 h-3 w-3" />
        Upcoming Appointments
      </h2>
      <Card>
        {(isLoading || !elderNames) && <p>Loading upcoming appointments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && appointments.length === 0 && (
          <p className="text-gray-500">No upcoming appointments.</p>
        )}
        {!isLoading && !error && appointments.length > 0 && elderNames && (
          <ul className="flex flex-col gap-4">
            {appointments.map((appointment) => (
              <li
                key={appointment.appt_id}
                className=" border-gray-200 dark:border-neutral-800 py-1 border-l-4 border-l-primary pl-5">
                {renderTimeInfo(
                  appointment.startDateTime,
                  appointment.endDateTime
                )}
                <div className="font-medium">
                  {appointment.name}{" "}
                  {appointment.elder_id in elderNames &&
                    `with ${elderNames[appointment.elder_id]}`}
                </div>
                <div className="text-xs text-gray-500">
                  <MapPin className="inline-block w-3 h-3" />{" "}
                  {appointment.loc || "Not specified"}
                </div>
                {appointment.details && (
                  <div className="text-xs text-gray-500">
                    <Pen className="inline-block w-3 h-3" />{" "}
                    {appointment.details}
                  </div>
                )}
                {appointment.accepted ? (
                  <div className="text-xs text-green-500">Accepted</div>
                ) : (
                  <div className="text-xs text-red-500">
                    Nobody has accepted yet!
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
