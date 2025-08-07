import { useEffect, useState, useMemo } from "react";
import { http } from "@/lib/http";
import type { Appointment } from "@carely/core";
import type { AxiosResponse, AxiosError } from "axios";

/**
 * Hook to get today's tasks (accepted appointments happening today)
 */
export function useTodayTasks() {
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
          setAppointments(res.data);
        },
        (error: AxiosError) => {
          if (error.name === "CanceledError") {
            console.warn("Request was cancelled:", error);
            return;
          }
          setError("Failed to fetch appointments");
          console.error("Error fetching appointments:", error);
        }
      )
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
      setAppointments([]);
      setError(undefined);
    };
  }, []);

  // Calculate today's tasks (accepted appointments happening today)
  const todayTasks = useMemo(() => {
    if (!appointments) return 0;

    const today = new Date();
    const todayString = today.toDateString();

    return appointments.filter((appointment) => {
      // Check if appointment is accepted
      if (!appointment.accepted) return false;

      // Check if appointment is happening today
      const appointmentDate = new Date(appointment.startDateTime);
      const appointmentDateString = appointmentDate.toDateString();

      return appointmentDateString === todayString;
    }).length;
  }, [appointments]);

  return { todayTasks, error, isLoading };
}
