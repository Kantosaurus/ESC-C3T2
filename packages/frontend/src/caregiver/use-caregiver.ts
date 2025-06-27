import { useEffect, useState } from "react";
import type { Caregiver } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";

/**
 * Get current user info
 */
export function useCaregiver(config?: { onNotFound?: () => void }) {
  const [caregiverDetails, setCaregiverDetails] = useState<Caregiver>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    http()
      .get("/api/caregiver/self", {
        signal: controller.signal,
      })
      .then(
        (res: AxiosResponse<Caregiver>) => {
          setCaregiverDetails(res.data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { caregiverDetails, error, isLoading };
}
