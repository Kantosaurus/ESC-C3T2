import { useEffect, useState, useCallback } from "react";
import type { Caregiver } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { http } from "@/lib/http";

/**
 * Hook to get all caregivers associated with a specific elder.
 */
export function useCaregiversByElderId(elderId: number | null) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaregivers = useCallback(async () => {
    if (!elderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res: AxiosResponse<Caregiver[]> = await http().get(
        `/api/caregiver/elder/${elderId}`
      );
      setCaregivers(res.data);
      setError(null);
    } catch (error: unknown) {
      console.error("Error fetching caregivers:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response
      ) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          setError("No caregivers found for this elder");
        } else {
          setError("Failed to fetch caregivers");
        }
      } else {
        setError("Failed to fetch caregivers");
      }
    } finally {
      setIsLoading(false);
    }
  }, [elderId]);

  useEffect(() => {
    fetchCaregivers();
  }, [fetchCaregivers]);

  return { caregivers, error, isLoading, refetch: fetchCaregivers };
}
