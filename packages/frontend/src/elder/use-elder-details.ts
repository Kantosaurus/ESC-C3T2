import { useEffect, useState } from "react";
import type { Elder } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";

/**
 * Get current user info
 */
export function useElderDetails() {
  const [elderDetails, setElderDetails] = useState<Elder[]>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    http()
      .get("/api/elder/details")
      .then(
        (res: AxiosResponse<Elder[]>) => {
          // check if there are no elders
          if (res.data.length <= 0) {
            console.warn("No elders found, redirecting to new elder page");
            navigate("/elder/new");
          }
          setElderDetails(res.data);
        },
        (error: AxiosError) => {
          if (error.response?.status === 404) {
            setError("Elders not found");
          }
        }
      )
      .finally(() => setIsLoading(false));
  }, [navigate]);

  return { elderDetails, error, isLoading };
}
