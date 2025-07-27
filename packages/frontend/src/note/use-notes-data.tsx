import { useCallback, useEffect, useState, useMemo } from "react";
import type { Note } from "@carely/core";
import type { Elder } from "@carely/core";
import { useCaregiver } from "@/caregiver/use-caregiver";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import Modal from "./notes-modal";

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
  const [isOpen, setisOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const toggle = () => {
    setisOpen(!isOpen);
  };

  const handleOpenModal = (note: Note) => {
    setSelectedNote(note);
    setisOpen(true);
  };

  const onDelete = (deletedNote: Note) => {
    setNoteDetails((prev) =>
      prev?.filter((note) => note.id !== deletedNote.id)
    );
    setSelectedNote(null);
    setisOpen(false);
  };

  // Get notes with elder headers at the top
  const notesWithHeaders = useMemo(() => {
    if (!NoteDetails || !elderDetails) return [];

    // Group notes by elderid, using a Record(like a hashmap) to map elderId to note objects
    const groupedNotesByElder = NoteDetails.reduce((accumulator, note) => {
      const elderId = note.assigned_elder_id;
      if (!accumulator[elderId]) {
        accumulator[elderId] = [];
      }
      accumulator[elderId].push(note);
      return accumulator;
    }, {} as Record<number, Note[]>);

    //Sort notes objs in desc order under each elder, most recent updated to the top
    Object.keys(groupedNotesByElder).forEach((elderId) => {
      groupedNotesByElder[Number(elderId)].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

    const result: Array<{
      note: Note;
      matchingElder: Elder | undefined;
      showElderHeading: boolean;
    }> = [];

    // Array to store final sorted notes with elder headings
    const sortedElders = elderDetails.sort((elderA, elderB) => {
      const elderANotes = groupedNotesByElder[elderA.id] || [];
      const elderBNotes = groupedNotesByElder[elderB.id] || [];

      // Get date where elder note is most recently updated
      const elderAMostRecent = elderANotes[0]?.updated_at || "";
      const elderBMostRecent = elderBNotes[0]?.updated_at || "";
      return (
        new Date(elderBMostRecent).getTime() -
        new Date(elderAMostRecent).getTime()
      );
    });

    sortedElders.forEach((elder) => {
      const elderNotes = groupedNotesByElder[elder.id] || [];
      elderNotes.forEach((note) => {
        result.push({
          note,
          matchingElder: elder,
          // Only first note of each elder group shows heading
          showElderHeading: elderNotes.indexOf(note) === 0,
        });
      });
    });

    return result;
  }, [NoteDetails, elderDetails]);

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    Promise.all([
      http().get("/api/notes/details", { signal: controller.signal }),
      http().get("/api/elder/details", { signal: controller.signal }),
    ])
      .then(
        ([noteRes, elderRes]: [
          AxiosResponse<Note[]>,
          AxiosResponse<Elder[]>
        ]) => {
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
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!elderDetails || elderDetails.length === 0) {
    return (
      <div className="p-10 mx-auto">
        <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center border border-gray-200">
          <p className="text-gray-600 mb-4">
            Need an elder to assign for notes
          </p>
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
          {notesWithHeaders.map(({ note, matchingElder, showElderHeading }) => (
            <div key={note.id}>
              {showElderHeading && (
                <h2 className="text-lg font-bold mt-6 mb-2">
                  {matchingElder?.name}
                </h2>
              )}
              <li className="p-4 bg-indigo-20 rounded-lg shadow-md p-6 border border-gray-200">
                <p className="text-sm text-gray-600">
                  Assigned to: {matchingElder ? matchingElder.name : "Unknown"}
                </p>
                <p className="font-extrabold">{note.header}</p>
                <p
                  className="text-sm text-gray-800 whitespace-pre-wrap"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {note.content}
                </p>
                <p className="text-xs text-gray-500">
                  Created By: {caregiverDetails?.name || "Unknown"}
                </p>
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
                <Button className="mt-4" onClick={() => handleOpenModal(note)}>Open me</Button>
              </li>
            </div>
          ))}

          {selectedNote && (
            <Modal
              isOpen={isOpen}
              toggle={toggle}
              note={selectedNote}
              onDelete={onDelete}
              elderDetails={elderDetails}
            ></Modal>
          )}
        </ul>
      )}
    </>
  );
}
