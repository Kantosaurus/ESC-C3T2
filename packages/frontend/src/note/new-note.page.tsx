import { http } from "@/lib/http";
import type { NewNoteDto } from "@carely/core";
import { AddNoteForm, type AddNoteFormType } from "./add-note.form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import AppNavbar from "@/nav/navbar";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      toast.success("Note created successfully!");
      navigate("/notes");
    } catch {
      toast.error("Failed to create note. Please try again.");
    }
  };

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
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Note
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add details for reminders, tasks, or any other notes you want to
              keep track of
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-soft p-8">
          <AddNoteForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
