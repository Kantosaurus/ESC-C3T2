import { useEffect, useState } from "react";
import { http } from "../lib/http";

// TODO: Implement this

/**
 * Get current user info
 */
export function useUser() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    setIsLoading(true);
    http
      .get("/")
      .then((res) => setUser(res.data))
      .catch((error) => setError(error.toJSON()))
      .finally(() => setIsLoading(false));
  }, []);

  return { user, error, isLoading };
}
