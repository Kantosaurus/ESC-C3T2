import { http } from "@/lib/http";

export const getSingpassAuthUrl = () =>
  http().get<{ url: string }>("/api/singpass/auth-url");
