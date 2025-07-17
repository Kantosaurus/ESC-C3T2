import { useEffect, useState } from "react";
import type { Note } from "@carely/core";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";

/**
 * Get all notes that the caregiver is associated with.
 */
export function NoteDetails() {
  const [NoteDetails, setNoteDetails] = useState<Note[]>();
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
        ([noteRes]: [AxiosResponse<Note[]>]) => {
          setNoteDetails(noteRes.data);
          // check if there are no note
          if (noteRes.data.length <= 0) {
            console.warn("No note found, please create a new note.");
            // navigate("/notes/new");
            return;
          }
          setNoteDetails(noteRes.data);
        },
        (error: AxiosError) => {
          if (error.response?.status === 404) {
            setError("Note not found");
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
      <h1 className="text-2xl font-bold mb-2">Notes List</h1>
      {NoteDetails && NoteDetails.length === 0 ? (
        <p className="text-gray-500">No notes created, please create a new note! :)</p>
      ) : (
        <ul className="space-y-4">
          {NoteDetails?.map((note) => (
            <li key={note.id} className="p-4 bg-indigo-50">
              {/* TODO: Retrieve elder's name and created by: caregiver's name */}
              <p className="text-sm text-gray-600">Assigned to: {note.assigned_elder_id}</p>
              <p className="font-extrabold">{note.header}</p>
              <p className="text-sm text-gray-800">{note.content}</p>
              {/* TODO: Fix date and timestamp to be accurate */}
              <p className="text-xs text-gray-500">
                Created at: {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500">
                Updated at: {new Date(note.updated_at).toLocaleDateString()} {new Date(note.updated_at).toLocaleTimeString()} 
              </p>
            </li>
          ))}
        </ul>)}


    </div>
  );
}

