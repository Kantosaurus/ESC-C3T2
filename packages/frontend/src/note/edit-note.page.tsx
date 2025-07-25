import { http } from "@/lib/http";
import { EditNoteForm, type EditNoteFormType } from "./edit-note.form";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import type { Note } from "@carely/core";

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

export default function EditNotePage() {
  const location = useLocation();
  const [note] = useState<Note | null>(location.state?.note ?? null);
  const navigate = useNavigate();
  const editNote = useEditNote();

  useEffect(() => {
    if (!note) {
      toast.error("Failed to fetch note");
      navigate("/notes");
    }
  }, [note, navigate]);

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

  if (!note) {
    navigate("/notes");
    return <div>Note not found</div>;
  }

  return (
    <>
      <section className="bg-indigo-100 text-indigo-800">
        <div className="p-8 mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">Add New Note</h1>
          <p>
            Add in details for reminders, tasks, or any other notes you want to
            keep track of.
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
