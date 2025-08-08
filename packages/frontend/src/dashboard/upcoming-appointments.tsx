import Card from "@/components/ui/card";
import { http } from "@/lib/http";
import type { Appointment } from "@carely/core";
import type { AxiosResponse, AxiosError } from "axios";
import { Calendar, MapPin, Pen, Filter, User, Users } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "my-appointments" | "by-elder";

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
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedElderId, setSelectedElderId] = useState<string>("");

  // Get unique elder IDs from appointments
  const elderIds = useMemo(() => {
    if (!appointments || !elderNames) return [];
    return Array.from(
      new Set(appointments.map((apt) => apt.elder_id.toString()))
    );
  }, [appointments, elderNames]);

  // Filter appointments based on selected filter
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    switch (filterType) {
      case "my-appointments":
        // Filter appointments that the current user has accepted
        return appointments.filter((apt) => apt.accepted);
      case "by-elder":
        // Filter appointments for a specific elder
        if (selectedElderId) {
          return appointments.filter(
            (apt) => apt.elder_id.toString() === selectedElderId
          );
        }
        return appointments;
      default:
        return appointments;
    }
  }, [appointments, filterType, selectedElderId]);

  const handleFilterChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== "by-elder") {
      setSelectedElderId("");
    }
  };

  const handleElderChange = (elderId: string) => {
    setSelectedElderId(elderId);
    setFilterType("by-elder");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
        <h2 className="font-semibold flex flex-row items-center text-xs text-muted-foreground">
          <Calendar className="inline-block mr-1 h-3 w-3" />
          Upcoming Appointments
        </h2>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>Filter:</span>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("all")}
              className="h-6 px-2 text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              All
            </Button>

            <Button
              variant={filterType === "my-appointments" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("my-appointments")}
              className="h-6 px-2 text-xs"
            >
              <User className="h-3 w-3 mr-1" />
              My Appointments
            </Button>

            {elderIds.length > 1 && (
              <div className="flex items-center gap-1">
                <select
                  value={selectedElderId}
                  onChange={(e) => handleElderChange(e.target.value)}
                  className="h-6 px-2 text-xs border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="">Select Elder</option>
                  {elderIds.map((elderId) => (
                    <option key={elderId} value={elderId}>
                      {elderNames?.[elderId] || `Elder ${elderId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(filterType !== "all" || selectedElderId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setSelectedElderId("");
                }}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        {(isLoading || !elderNames) && <p>Loading upcoming appointments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && filteredAppointments.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {filterType === "my-appointments"
                ? "No appointments you've accepted yet."
                : filterType === "by-elder" && selectedElderId
                ? `No upcoming appointments for ${
                    elderNames?.[selectedElderId] || `Elder ${selectedElderId}`
                  }.`
                : "No upcoming appointments."}
            </p>
          </div>
        )}
        {!isLoading && !error && filteredAppointments.length > 0 && (
          <div className="mb-3 px-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filterType === "my-appointments"
                  ? "Showing your accepted appointments"
                  : filterType === "by-elder" && selectedElderId
                  ? `Showing appointments for ${
                      elderNames?.[selectedElderId] ||
                      `Elder ${selectedElderId}`
                    }`
                  : "Showing all upcoming appointments"}
              </span>
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {filteredAppointments.length} appointment
                {filteredAppointments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
        {!isLoading &&
          !error &&
          filteredAppointments.length > 0 &&
          elderNames && (
            <ul className="flex flex-col gap-4">
              {filteredAppointments.map((appointment) => (
                <li
                  key={appointment.appt_id}
                  className=" border-gray-200 dark:border-neutral-800 py-1 border-l-4 border-l-primary pl-5"
                >
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
