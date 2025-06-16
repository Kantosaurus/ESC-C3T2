import { useEffect, useState } from "react";
import { useQueryBuilder } from "@/lib/http";
import type { Caregiver } from "@esc-c3t2/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";

/**
 * Get current user info
 */
export function useCaregiver() {
  const qb = useQueryBuilder();
  const [caregiverDetails, setCaregiverDetails] = useState<Caregiver>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    qb()
      .then((http) => http.get("/api/caregiver/self"))
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
  }, [navigate, qb]);

  return { caregiverDetails, error, isLoading };
}
