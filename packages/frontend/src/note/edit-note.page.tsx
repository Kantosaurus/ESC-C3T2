import { http } from "@/lib/http";
import { EditNoteForm } from "./edit-note.form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import type { Note } from "@carely/core";
import { PageLoader } from "@/components/ui/page-loader";
import AppNavbar from "@/nav/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

const useEditNote = () => {
  return useCallback((values: Partial<Note> & { id: number }) => {
    return http()
      .post(`/api/notes/edit`, values)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error editing note:", error);
        throw error;
      });
  }, []);
};

const useNoteById = (noteId: string | null) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    http()
      .get(`/api/notes/${noteId}`)
      .then((res) => {
        setNote(res.data);
      })
      .catch((error) => {
        console.error("Error fetching note:", error);
        if (error.response?.status === 404) {
          setError("Note not found");
        } else if (error.response?.status === 403) {
          setError("You are not authorized to access this note");
        } else {
          setError("Failed to fetch note");
        }
      })
      .finally(() => setIsLoading(false));
  }, [noteId]);

  return { note, isLoading, error };
};

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const { note, isLoading, error } = useNoteById(id || null);
  const navigate = useNavigate();
  const editNote = useEditNote();

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate("/notes");
    }
  }, [error, navigate]);

  const handleUpdateNote = async (values: {
    id: number;
    header: string;
    content?: string | null;
    assigned_elder_id: number;
  }) => {
    if (!note) return;

    console.log("Submitting note with values:", values);
    try {
      await editNote({
        ...values,
        id: note.id,
      });
      toast.success("Note updated successfully");
      navigate("/notes");
    } catch {
      toast.error("Failed to update note. Please try again.");
    }
  };

  if (isLoading) {
    return <PageLoader loading={true} pageType="notes" />;
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Note not found</p>
          <button
            onClick={() => navigate("/notes")}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <AppNavbar />

      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/notes")}
            className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Edit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Note
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update the note details for reminders, tasks, or any other notes
              you want to keep track of
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-soft p-8">
          <EditNoteForm
            defaultValues={{
              id: note.id,
              header: note.header,
              content: note.content,
              assigned_elder_id: note.assigned_elder_id?.toString() || "",
            }}
            onSubmit={handleUpdateNote}
          />
        </div>
      </div>
    </div>
  );
}
