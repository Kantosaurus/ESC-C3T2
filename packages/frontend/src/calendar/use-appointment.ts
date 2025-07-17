import { useCallback, useState, useEffect } from "react";
import { type AppointmentFormType } from "./appointment.form";
import { http } from "@/lib/http";

export function useCreateAppointment() {
  return useCallback((values: AppointmentFormType) => {
    return http()
      .post("/api/appointment/new", values)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error creating appointment:", error);
        throw error;
      });
  }, []);
}

export function useGetAppointments(elder_id: number | null) {
  const [appointments, setAppointments] = useState<AppointmentFormType[]>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!elder_id) return;

    setIsLoading(true);
    http()
      .get(`/api/appointments/${elder_id}`)
      .then(
        (res) => {
          setAppointments(res.data);
        },
        (error) => {
          if (error.response?.status === 404) {
            setError("Appointments not found");
          } else {
            setError("Failed to fetch appointments");
          }
        }
      )
      .finally(() => setIsLoading(false));
  }, [elder_id]);

  return { appointments, error, isLoading };
}
