import axios from "axios";
import { env } from "./env";
import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

export const http = axios.create({
  baseURL: env.BACKEND_URL,
});

/**
 * Build a HTTP query
 */
export function useQueryBuilder() {
  const { getToken } = useAuth();

  return useCallback(
    (opts: { requireAuth?: boolean } = { requireAuth: false }) =>
      getToken()
        .then((token) => {
          console.log(token);
          if (!token) throw new Error("no token");
          return axios.create({
            baseURL: env.BACKEND_URL,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        })
        .catch(() => {
          if (opts.requireAuth) {
            throw new Error("Login is required for this request");
          } else {
            return http;
          }
        }),
    [getToken]
  );
}
