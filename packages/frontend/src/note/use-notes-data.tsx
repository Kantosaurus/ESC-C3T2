import { useEffect, useState } from "react";
import type { Note } from "@carely/core";
import type { Elder } from "@carely/core";
import { useCaregiver } from "@/caregiver/use-caregiver";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";

/**
 * Get all notes that the caregiver is associated with.
 */
export function NoteDetails() {
  const [NoteDetails, setNoteDetails] = useState<Note[]>();
  const [elderDetails, setElderDetails] = useState<Elder[]>();
  const { caregiverDetails } = useCaregiver();

  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    Promise.all([
      http().get("/api/notes/details", { signal: controller.signal }),
      http().get("/api/elder/details", { signal: controller.signal }),
    ])
      .then(
        ([noteRes, elderRes]:
          [AxiosResponse<Note[]>,
            AxiosResponse<Elder[]>]
        ) => {
          setNoteDetails(noteRes.data);
          setElderDetails(elderRes.data);
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
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!elderDetails || elderDetails.length === 0) {
    return (
      <div className="p-10 mx-auto">
        <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center border border-gray-200">
          <p className="text-gray-600 mb-4">Need an elder to assign for notes</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Add an Elder profile to continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {NoteDetails && NoteDetails.length === 0 ? (
        <p className="text-gray-500">
          No notes created, please create a new note! :)
        </p>
      ) : (
        <ul className="space-y-4">
          {NoteDetails?.map((note) => {
            // Find the elder that matches the note's assigned elder id
            const matchingElder = elderDetails?.find(elder => elder.id === note.assigned_elder_id);
            return (
              <li key={note.id} className="p-4 bg-indigo-20 rounded-lg shadow-md p-6 border border-gray-200">
                <p className="text-sm text-gray-600">
                  Assigned to: {matchingElder ? matchingElder.name : "Unknown"}
                </p>
                <p className="font-extrabold">{note.header}</p>
                <p 
                  className="text-sm text-gray-800 whitespace-pre-wrap"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {note.content}
                </p>
                <p className="text-xs text-gray-500">Created By: {caregiverDetails?.name || "Unknown"}</p>
                {/* Date format as DD/MM/YYYY */}
                <p className="text-xs text-gray-500">
                  Created at:{" "}
                  {new Date(note.created_at).toLocaleDateString("en-GB")}{" "}
                  {new Date(note.created_at).toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">
                  Updated at:{" "}
                  {new Date(note.updated_at).toLocaleDateString("en-GB")}{" "}
                  {new Date(note.updated_at).toLocaleTimeString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}