import { useState, useEffect } from "react";
import { http } from "@/lib/http";

interface Note {
  id: number;
  header: string;
  content: string | null;
  caregiver_id: string;
  assigned_elder_id: number;
  created_at: Date;
  updated_at: Date;
  elder_name: string;
}

export function useCaregiverNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await http().get<Note[]>("/api/notes/details");
        setNotes(response.data);
      } catch (err) {
        console.error("Failed to fetch caregiver notes:", err);
        setError("Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return { notes, isLoading, error };
}
