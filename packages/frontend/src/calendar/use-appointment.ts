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

  const fetchAppointments = useCallback(() => {
    if (!elder_id) return;

    setIsLoading(true);
    http()
      .get(`/api/appointments/${elder_id}`)
      .then(
        (res) => {
          setAppointments(res.data);
          setError(undefined);
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

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, error, isLoading, refetch: fetchAppointments };
}

export function useDeleteAppointment() {
  return useCallback(
    (
      values: Pick<
        AppointmentFormType,
        "elder_id" | "startDateTime" | "endDateTime"
      >
    ) => {
      return http()
        .post("/api/appointment/delete", values)
        .then((res) => res.data)
        .catch((error) => {
          console.error("Error deleting appointment:", error);
          throw error;
        });
    },
    []
  );
}
