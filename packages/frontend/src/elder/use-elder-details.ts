import { useEffect, useState, useCallback } from "react";
import type { Elder } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { http } from "@/lib/http";

/**
 * Get all elders that the caregiver is associated with.
 */
export function useEldersDetails() {
  const [elderDetails, setElderDetails] = useState<Elder[]>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchElders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await http().get("/api/elder/details");
      setElderDetails(res.data);
      setError(undefined);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 404
      ) {
        setError("Elders not found");
      } else {
        setError("Failed to fetch elders");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElders();
  }, [fetchElders]);

  return { elderDetails, error, isLoading, refetch: fetchElders };
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
