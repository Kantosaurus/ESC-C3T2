import { useEffect, useState, useCallback } from "react";
import type { Caregiver } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/http";

/**
 * Get current user info
 */
export function useCaregiver(config?: { onNotFound?: () => void }) {
  const [caregiverDetails, setCaregiverDetails] = useState<Caregiver>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const fetchCaregiverDetails = useCallback(() => {
    setIsLoading(true);
    const controller = new AbortController();

    http()
      .get("/api/caregiver/self", {
        signal: controller.signal,
      })
      .then(
        (res: AxiosResponse<Caregiver>) => {
          setCaregiverDetails(res.data);
          setError(undefined);
        },
        (error: AxiosError) => {
          if (error.status === 404) {
            if (config?.onNotFound) {
              config.onNotFound();
            } else {
              navigate("/caregiver/new");
            }
          } else {
            setError(
              "Unexpected error occurred while fetching caregiver details"
            );
          }
        }
      )
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
    };
  }, [config, navigate]);

  useEffect(() => {
    fetchCaregiverDetails();
  }, [fetchCaregiverDetails]);

  return { caregiverDetails, error, isLoading, refetch: fetchCaregiverDetails };
}
