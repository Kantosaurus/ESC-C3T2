import { http } from "@/lib/http";
import { useCallback } from "react";

export function useDeleteNote() {
  return useCallback((note: { id: number }) => {
    return http()
      .post("/api/notes/delete", note)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Failed to delete note:", error);
        throw error;
      });
  }, []);
}
