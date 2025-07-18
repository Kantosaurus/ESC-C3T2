import { http } from "@/lib/http";
import type { NewNoteDto } from "@carely/core";
import { AddNoteForm, type AddNoteFormType } from "./add-note.form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const addNewNote = (values: NewNoteDto) =>
  http()
    .post("/api/notes/new", values)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error creating note:", error);
      throw error;
    });

export default function NewNotePage() {
  const navigate = useNavigate();
  const handleSubmit = async (values: AddNoteFormType) => {
    console.log("Submitting note with values:", values);
    try {
      await addNewNote({
        ...values,
        assigned_elder_id: Number(values.assigned_elder_id),
      });
      navigate("/notes");
    } catch {
      toast.error("Failed to create note. Please try again.");
    }
  };

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
        <AddNoteForm onSubmit={handleSubmit} />
      </section>
    </>
  );
}
