import axios from "axios";
import { env } from "./env";
import { getToken } from "@/auth/token";

export const http = () =>
  axios.create({
    baseURL: env.BACKEND_URL,
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
  });
