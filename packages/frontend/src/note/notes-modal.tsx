import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteNote } from "./use-notes-data";
import { Button } from "@/components/ui/button";
import type { Note } from "@carely/core";
import { Edit } from "lucide-react";
import type { Elder } from "@carely/core";
import { toast } from "sonner";
import { http } from "@/lib/http";
//import { se } from "date-fns/locale";

interface ModalType {
  children?: ReactNode;
  onClose: () => void;
  onDelete: (note: Note) => void;
  note: Note;
  elderDetails: Elder[];
}

export default function Modal({
  onClose,
  note,
  onDelete,
  children,
  elderDetails,
}: ModalType) {
  const navigate = useNavigate();
  const deleteNote = useDeleteNote();
  const [isLocking, setIsLocking] = useState(false); // prevent double clicks
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditNote = async () => {
    setIsLocking(true);
    try {
      // Try to lock the note before navigating to edit
      await http().post(`/api/notes/${note.id}/lock`);

      // If we get here, locking was successful
      navigate(`/notes/${note.id}/edit`);
    } catch (error: any) {
      if (error.response?.status === 423) {
        toast.error("Please wait, another caregiver is editing this note");
      } else {
        console.error("Failed to lock note:", error);
        toast.error("Failed to start editing. Please try again.");
        // Still allow editing even if locking fails (fallback)
        navigate(`/notes/${note.id}/edit`);
      }
    } finally {
      setIsLocking(false);
    }
  };

  const handleDeleteNote = async () => {
    setIsDeleting(true);

    try {
      // 1. First check lock status
      const lockStatus = await http().get(`/api/notes/${note.id}/lock-status`);

      if (lockStatus.data.locked_by) {
        // Note is locked - show error immediately
        toast.error(
          "Cannot delete note: It's currently being edited by another caregiver"
        );
        return;
      }

      // 2. Only show confirmation if note isn't locked
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this note?"
      );
      if (!confirmDelete) return;

      // 3. Proceed with deletion
      await deleteNote({ id: note.id });
      onDelete(note);
      onClose();
      toast.success("Note deleted successfully");
    } catch (error: any) {
      if (error.response?.status === 423) {
        toast.error("Cannot delete - note is currently locked");
      } else {
        toast.error("Failed to delete note");
        console.error("Delete error:", error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /*const handleDeleteNote = async () => {
    setIsDeleting(true);
    const noteId = Number(req.params.id);
    const userId = res.locals.user.userId;
    const note = await getNoteDetails(noteId);
    if (note.locked_by !== null) {
        return res.status(423).json({
        error: "Note is locked",
        message: "Cannot delete note when another caregiver is editing. Please wait.",
      });
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!confirmDelete) return;

    try {
      await deleteNote({ id: note.id });
      onDelete(note);
      onClose();
    } catch (error) {
      console.error("Failed to delete note", error);
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  }; */

  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="block bg-white w-[40%] h-[50%] p-4 rounded-[1rem]"
      >
        <Button
          className="text-left px-4 py-2 text-sm text-gray-700 bg-gray-300 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          onClick={handleEditNote}
          variant="outline"
          disabled={isLocking}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isLocking ? "Preparing edit..." : "Edit note"}
        </Button>

        {note.locked_by && (
          <p className="text-xs text-yellow-600 mt-1">
            {note.locked_by === note.caregiver_id
              ? "You're currently editing this note"
              : "Currently being edited by another caregiver"}
          </p>
        )}

        <p className="mt-4 text-sm text-gray-600">
          Assigned to:{" "}
          {elderDetails.find((e) => e.id === note.assigned_elder_id)?.name ||
            "Unknown"}
        </p>
        <p className="font-extrabold">{note.header}</p>
        <p className="text-sm text-gray-800">{note.content}</p>

        <p className="text-xs text-gray-500">
          Created at: {new Date(note.created_at).toLocaleDateString("en-GB")}{" "}
          {new Date(note.created_at).toLocaleTimeString()}
        </p>
        <p className="text-xs text-gray-500">
          Updated at: {new Date(note.updated_at).toLocaleDateString("en-GB")}{" "}
          {new Date(note.updated_at).toLocaleTimeString()}
        </p>

        <Button
          className="w-full text-left px-4 my-2 text-sm hover:bg-blue-700 dark:hover:bg-neutral-800 transition"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          className="w-full text-left px-4 py-2 text-sm bg-red-500 hover:bg-red-700 dark:hover:bg-neutral-800 transition"
          onClick={handleDeleteNote}
          disabled={isDeleting}
        >
          Delete Note
        </Button>
        {children}
      </div>
    </div>
  );
}
