import { useEffect, useState } from "react";
import { useQueryBuilder } from "./lib/http";

/**
 * Get current user info
 */
export function useTest() {
  const qb = useQueryBuilder();
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    setIsLoading(true);
    qb()
      .then((http) => http.get("/api/test/"))
      .then((res) => setMessage(res.data))
      .catch((error) => setError(error.toJSON()))
      .finally(() => setIsLoading(false));
  }, [qb]);

  return { msg, error, isLoading };
}
