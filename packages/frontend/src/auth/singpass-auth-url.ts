import { http } from "@/lib/http";

export const getSingpassAuthUrl = (after?: string) =>
  http().get<{ url: string }>("/api/singpass/auth-url", {
    params: {
      after,
    },
  });
