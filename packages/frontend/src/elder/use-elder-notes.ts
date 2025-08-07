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
  caregiver_name: string | null;
}

export function useElderNotes(elderId: number) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!elderId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await http().get<Note[]>(
          `/api/notes/elder/${elderId}`
        );
        setNotes(response.data);
      } catch (err) {
        console.error("Failed to fetch elder notes:", err);
        setError("Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [elderId]);

  return { notes, isLoading, error };
}
