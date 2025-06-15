import axios from "axios";
import { env } from "./env";

export const http = axios.create({
  baseURL: env.BACKEND_URL,
});
