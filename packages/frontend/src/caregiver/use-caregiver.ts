import { useEffect, useState } from "react";
import type { Caregiver } from "@esc-c3t2/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";

/**
 * Get current user info
 */
export function useCaregiver() {
  const [caregiverDetails, setCaregiverDetails] = useState<Caregiver>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    http()
      .get("/api/caregiver/self")
      .then(
        (res: AxiosResponse<Caregiver>) => {
          setCaregiverDetails(res.data);
        },
        (error: AxiosError) => {
          if (error.status === 404) {
            navigate("/caregiver/new");
            setError("Caregiver not found");
            // redirect to create caregiver page
          }
        }
      )
      .finally(() => setIsLoading(false));
  }, [navigate]);

  return { caregiverDetails, error, isLoading };
}
