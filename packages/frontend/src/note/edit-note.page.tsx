import { http } from "@/lib/http";
import { EditNoteForm, type EditNoteFormType } from "./edit-note.form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import type { Note } from "@carely/core";
import { useNoteLock } from "./use-note-lock";

const useEditNote = () => {
  return useCallback((values: Partial<Note> & { id: number }) => {
    return http()
      .patch(`/api/notes/${values.id}/edit`, values) //Changed to include /edit at the end
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error editing note:", error);
        throw error;
      });
  }, []);
};

const useNoteById = (noteId: number | string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await http().get(`/api/notes/${noteId}`);
        setNote(res.data);
      } catch (err) {
        console.error("Failed to fetch note", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);
  return { note, loading };
};

export default function EditNotePage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const editNote = useEditNote();
  const { note, loading } = useNoteById(Number(noteId));
  const { lockNote, unlockNote } = useNoteLock();

  useEffect(() => {
    if (!loading && !note) {
      toast.error("Failed to fetch note");
      navigate("/notes");
    }
  }, [note, loading, navigate]);

  useEffect(() => {
    const handleLockNote = async () => {
      if (note?.id) {
        try {
          await lockNote(note.id);
        } catch {
          navigate("/notes");
        }
      }
    };

    if (note?.id) {
      handleLockNote();
    }

    return () => {
      if (note?.id) {
        unlockNote(note.id).catch(console.error);
      }
    };
  }, [note?.id, lockNote, unlockNote, navigate]);

  if (!note) return null;

  const handleUpdateNote = async (values: EditNoteFormType) => {
    console.log("Submitting note with values:", values);
    try {
      await editNote({
        ...values,
      });
      navigate("/notes");
    } catch {
      toast.error("Failed to update note. Please try again.");
    }
  };

  return (
    <>
      <section className="bg-indigo-100 text-indigo-800">
        <div className="p-8 mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">Edit Note</h1>
          <p>
            Edit the note details for reminders, tasks, or any other notes you
            want to keep track of.
          </p>
        </div>
      </section>

      <section className="p-8 mx-auto max-w-2xl">
        <EditNoteForm
          defaultValues={{
            id: note.id,
            header: note.header,
            content: note.content,
            assigned_elder_id: note.assigned_elder_id,
          }}
          onSubmit={handleUpdateNote}
        />
      </section>
    </>
  );
}
