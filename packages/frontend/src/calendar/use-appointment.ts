import { useCallback, useState, useEffect } from "react";
import { type AppointmentFormType } from "./appointment.form";
import { http } from "@/lib/http";
import type { Appointment } from "@carely/core/dist/appointment/appointment.schema";
import type { Caregiver } from "@carely/core";

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
  const [appointments, setAppointments] = useState<Appointment[]>();
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

export function useGetAppointment(elder_id: number, appt_id: number) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointment = useCallback(() => {
    if (!elder_id) return;

    setIsLoading(true);
    http()
      .get(`/api/appointment/${elder_id}/${appt_id}`)
      .then(
        (res) => {
          setAppointment(res.data);
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
  }, [elder_id, appt_id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  return {
    appointment,
    error,
    isLoading,
    refetchAppointment: fetchAppointment,
  };
}

export function useDeleteAppointment() {
  return useCallback(
    (values: Pick<AppointmentFormType, "elder_id" | "appt_id">) => {
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

export function useUpdateAppointment() {
  return useCallback((values: AppointmentFormType) => {
    return http()
      .patch("/api/appointment/update", values)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error updating appointment:", error);
        throw error;
      });
  }, []);
}

export function useGetPendingAppointments() {
  const [pending, setPending] = useState<Appointment[]>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = useCallback(() => {
    setIsLoading(true);
    http()
      .get(`/api/appointment/pending`)
      .then(
        (res) => {
          setPending(res.data);
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
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { pending, error, isLoading, refetchPending: fetchAppointments };
}

export function useGetDeclinedAppointments(elder_id: number | null) {
  const [declined, setDeclined] = useState<
    Pick<Appointment, "appt_id">[] | null
  >(null);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointment = useCallback(() => {
    if (!elder_id) return;

    setIsLoading(true);
    http()
      .get(`/api/declined/${elder_id}`)
      .then(
        (res) => {
          setDeclined(res.data);
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
    fetchAppointment();
  }, [fetchAppointment]);

  return {
    declined,
    error,
    isLoading,
    refetchAppointment: fetchAppointment,
  };
}

export function useAcceptAppointment() {
  return useCallback(
    (values: {
      elder_id: number;
      appt_id: number | undefined;
      undo: boolean;
    }) => {
      return http()
        .post("/api/appointment/accept", values)
        .then((res) => res.data)
        .catch((error) => {
          console.error("Error accepting appointment:", error);
          throw error;
        });
    },
    []
  );
}

export function useDeclineAppointment() {
  return useCallback(
    async (
      values: {
        elder_id: number;
        appt_id: number | undefined;
        undo: boolean;
      },
      refetch?: () => void
    ) => {
      try {
        const res = await http().post("/api/appointment/decline", values);
        if (refetch) refetch();
        return res.data;
      } catch (error) {
        console.error("Error declining appointment:", error);
        throw error;
      }
    },
    []
  );
}

export function useGetCaregiver(caregiver_id: string | null | undefined) {
  const [caregiver, setCaregiver] = useState<Caregiver>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCaregiver = useCallback(() => {
    if (!caregiver_id) return;
    setIsLoading(true);

    http()
      .get(`/api/caregiver/${caregiver_id}`)
      .then(
        (res) => {
          setCaregiver(res.data);
          setError(undefined);
        },
        (error) => {
          if (error.response?.status === 404) {
            setError("Caregiver not found");
          } else {
            setError("Failed to fetch caregiver");
          }
        }
      )
      .finally(() => setIsLoading(false));
  }, [caregiver_id]);

  useEffect(() => {
    fetchCaregiver();
  }, [fetchCaregiver]);

  return { caregiver, error, isLoading, refetchPending: fetchCaregiver };
}
