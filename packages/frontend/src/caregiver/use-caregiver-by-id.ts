import { useEffect, useState } from "react";
import type { Caregiver } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { http } from "@/lib/http";

/**
 * Get caregiver details by ID for viewing other caregivers' profiles
 */
export function useCaregiverById(caregiverId: string | null) {
  const [caregiverDetails, setCaregiverDetails] = useState<Caregiver | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!caregiverId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    http()
      .get(`/api/caregiver/profile/${caregiverId}`)
      .then((res: AxiosResponse<Caregiver>) => {
        setCaregiverDetails(res.data);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 403) {
          setError(
            "Access denied. You can only view profiles of caregivers who share an elder with you."
          );
        } else if (error.response?.status === 404) {
          setError("Caregiver not found");
        } else {
          setError("Failed to fetch caregiver details");
        }
      })
      .finally(() => setIsLoading(false));
  }, [caregiverId]);

  return { caregiverDetails, error, isLoading };
}
