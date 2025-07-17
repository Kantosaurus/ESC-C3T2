import { useEffect, useState } from "react";
import type { Notes } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";

/**
 * Get all notes that the caregiver is associated with.
 */
export function NotesDetails() {
  const [notesDetails, setNotesDetails] = useState<Notes[]>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    Promise.all([
      http().get("/api/notes/details", { signal: controller.signal }),
    ])
      .then(
        ([notesRes]: [AxiosResponse<Notes[]>]) => {
          setNotesDetails(notesRes.data);
          // check if there are no notes
          if (notesRes.data.length <= 0) {
            console.warn("No notes found, redirecting to new notes page");
            navigate("/notes/new");
            return;
          }
          setNotesDetails(notesRes.data);
        },
        (error: AxiosError) => {
          if (error.response?.status === 404) {
            setError("Notes not found");
          }
        }
      )
      .finally(() => setIsLoading(false));

      return () => {
        controller.abort();
      }
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="p-8 mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">NotesList</h1>
      <ul className="space-y-4">
        {notesDetails?.map((notes) => (
          <li key={notes.id} className="p-4 bg-indigo-50">
            <p className="font-extrabold">{notes.header}</p>
            <p className="text-sm text-gray-800">{notes.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

