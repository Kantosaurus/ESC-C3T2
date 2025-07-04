import { useEffect, useState } from "react";
import type { Elder } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";

/**
 * Get all elders that the caregiver is associated with.
 */
export function useEldersDetails() {
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

export function useElderDetails(elderId: number | null) {
  const [elderDetails, setElderDetails] = useState<Elder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!elderId) {
      return;
    }
    setIsLoading(true);
    http()
      .get(`/api/elder/details/${elderId}`)
      .then((res: AxiosResponse<Elder>) => {
        setElderDetails(res.data);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 404) {
          setError("Elder not found");
        } else {
          setError("Failed to fetch elder details");
        }
      })
      .finally(() => setIsLoading(false));
  }, [elderId]);

  return { elderDetails, error, isLoading };
}
