import { http } from "@/lib/http";
import type { Caregiver, Elder } from "@carely/core";
import { type AxiosResponse, AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function useDashboardData() {
  const [caregiverDetails, setCaregiverDetails] = useState<Caregiver>();
  const [elderDetails, setElderDetails] = useState<Elder[]>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    Promise.all([
      http().get("/api/caregiver/self", { signal: controller.signal }),
      http().get("/api/elder/details", { signal: controller.signal }),
    ])
      .then(
        ([caregiverRes, elderRes]: [
          AxiosResponse<Caregiver>,
          AxiosResponse<Elder[]>
        ]) => {
          setCaregiverDetails(caregiverRes.data);
          // check if elderRes.data is empty
          if (elderRes.data.length === 0) {
            // Redirect to create elder page if no elders found
            navigate("/elder/new");
            return;
          }
          setElderDetails(elderRes.data);
        },
        (error: AxiosError) => {
          if (error.status === 404) {
            const urlSearchParams = new URLSearchParams();
            urlSearchParams.set("after", "/elder/new");
            navigate("/caregiver/new" + "?" + urlSearchParams.toString());
            setError("Caregiver not found");
          } else {
            setError("An error occurred while fetching data");
          }
        }
      )
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    caregiverDetails,
    elderDetails,
    error,
    isLoading,
  };
}
