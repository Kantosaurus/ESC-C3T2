import { useEffect, useState, useMemo } from "react";
import type { Note } from "@carely/core";
import type { Elder } from "@carely/core";
import { useCaregiver } from "@/caregiver/use-caregiver";
import type { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import Modal from "./notes-modal";
import Card from "@/components/ui/card";
import { Calendar, Clock, User, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </Card>
    );
  }

  if (!elderDetails || elderDetails.length === 0) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Elders Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to add an elder profile before creating notes.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">
          <User className="h-4 w-4" />
          Add Elder Profile
        </Button>
      </Card>
    );
  }

  return (
    <>
      {NoteDetails && NoteDetails.length === 0 ? (
        <Card className="text-center py-16 max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Notes Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by creating your first note to keep track of important
            information.
          </p>
          <Link to="/notes/new">
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Create First Note
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {notesWithHeaders.map(({ note, matchingElder, showElderHeading }) => (
            <div key={note.id}>
              {showElderHeading && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {matchingElder?.name}
                  </h2>
                  <div
                    className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                </div>
              )}

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div
                  data-testid="note-card"
                  className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    <div
                      className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        {note.header}
                      </h3>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/notes/${note.id}/edit`)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(note)}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {note.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{caregiverDetails?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(note.created_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(note.updated_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="lg:flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenModal(note)}
                      className="gap-2 w-full lg:w-auto"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          {selectedNote && (
            <Modal
              isOpen={isOpen}
              toggle={toggle}
              note={selectedNote}
              onDelete={onDelete}
              elderDetails={elderDetails}
            />
          )}
        </div>
      )}
    </>
  );
}
