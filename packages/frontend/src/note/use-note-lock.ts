// use-note-lock.ts
import { useCallback } from "react";
import { http } from "@/lib/http";
import { toast } from "sonner";

export function useNoteLock() {
  const lockNote = useCallback(async (noteId: number) => {
    try {
      const response = await http().post(`/api/notes/${noteId}/lock`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 423) {
        toast.error("Please wait, another caregiver is editing this note");
      } else {
        toast.error("Failed to lock note");
      }
      throw error;
    }
  }, []);

  const unlockNote = useCallback(async (noteId: number) => {
    try {
      await http().post(`/api/notes/${noteId}/unlock`);
    } catch (error) {
      console.error("Failed to unlock note", error);
    }
  }, []);

  return { lockNote, unlockNote };
}
