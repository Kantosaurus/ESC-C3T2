import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Custom hook to handle redirection after an action.
 * It checks for an "after" query parameter in the URL and redirects to that URL if it exists.
 * If the "after" parameter is not present, it redirects to a fallback URL (default is "/dashboard").
 * If there is an error decoding the "after" parameter, it logs the error and redirects to the fallback URL.
 */
export const useAfter = (fallback = "/dashboard") => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return useCallback(() => {
    try {
      const after = searchParams.get("after");
      if (after) {
        window.location.href = decodeURIComponent(after);
      } else {
        navigate(fallback);
      }
    } catch (error) {
      console.error("Error decoding 'after' parameter:", error);
      navigate(fallback);
      return fallback;
    }
  }, [fallback, navigate, searchParams]);
};
