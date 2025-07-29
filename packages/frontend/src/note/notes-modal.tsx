import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteNote } from "./use-delete-node";
import { Button } from "@/components/ui/button";
import type { Note } from "@carely/core";
import { Edit } from "lucide-react";
import type { Elder } from "@carely/core";
import {
  SafeNoteContent,
  SafeNoteHeader,
  SafeName,
} from "@/lib/xss-protection";

interface ModalType {
  children?: ReactNode;
  isOpen: boolean;
  toggle: () => void;
  onDelete: (note: Note) => void;
  note: Note;
  elderDetails: Elder[];
}

export default function Modal({
  isOpen,
  toggle,
  note,
  onDelete,
  children,
  elderDetails,
}: ModalType) {
  const navigate = useNavigate();
  const deleteNote = useDeleteNote();

  const handleDeleteNote = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!confirmDelete) return;

    try {
      console.log("Deleting Note:", note);
      await deleteNote({
        id: note.id,
      });
      onDelete(note);
      toggle();
    } catch (error) {
      console.error("failed to delete note", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center"
      onClick={toggle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="block bg-white w-[40%] h-[50%] p-4 rounded-[1rem]"
      >
        <Button
          className="text-left px-4 py-2 text-sm text-gray-700 bg-gray-300 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          onClick={() => navigate("/notes/edit", { state: { note } })}
          variant="outline"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit note
        </Button>
        <p className="mt-4 text-sm text-gray-600">
          Assigned to:{" "}
          <SafeName
            name={
              elderDetails.find((e) => e.id === note.assigned_elder_id)?.name ||
              "Unknown"
            }
          />
        </p>
        <SafeNoteHeader header={note.header} className="font-extrabold" />
        <SafeNoteContent
          content={note.content}
          className="text-sm text-gray-800"
        />
        {/* Date format as DD/MM/YYYY */}
        <p className="text-xs text-gray-500">
          Created at: {new Date(note.created_at).toLocaleDateString("en-GB")}{" "}
          {new Date(note.created_at).toLocaleTimeString()}
        </p>
        <p className="text-xs text-gray-500">
          Updated at: {new Date(note.updated_at).toLocaleDateString("en-GB")}{" "}
          {new Date(note.updated_at).toLocaleTimeString()}
        </p>
        <Button
          className="w-full text-left px-4 my-2 text-sm   hover:bg-blue-700 dark:hover:bg-neutral-800 transition"
          onClick={toggle}
        >
          Close
        </Button>
        <Button
          className="w-full text-left px-4 py-2 text-sm  bg-red-500 hover:bg-red-700 dark:hover:bg-neutral-800 transition"
          onClick={handleDeleteNote}
        >
          {" "}
          Delete Note
        </Button>
        {children}
      </div>
    </div>
  );
}
