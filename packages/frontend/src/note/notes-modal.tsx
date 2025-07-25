import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteNote } from "./use-notes-data";
import { Button } from "@/components/ui/button";
import type { Note } from "@carely/core";

interface ModalType {
  children?: ReactNode;
  isOpen: boolean;
  toggle: () => void;
  onDelete: (note: Note) => void;
  note: Note;
}

export default function Modal({
  isOpen,
  toggle,
  note,
  onDelete,
  children,
}: ModalType) {
  const navigate = useNavigate();
  const deleteNote = useDeleteNote();

  const handleDeleteNote = async () => {
    /*const confirmDelete = window.confirm("Are you sure you want to delete this note?")
      if (!confirmDelete) return;*/

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
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="block bg-white w-[70%] h-[70%] p-4 rounded-[1rem]"
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          onClick={() => navigate("/notes/edit", { state: { note } })}
        >
          Edit note?
        </button>
        <p className="text-sm text-gray-600">
          Assigned to: {note.assigned_elder_id}
        </p>
        <p className="font-extrabold">{note.header}</p>
        <p className="text-sm text-gray-800">{note.content}</p>
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
          className="w-full text-left px-4 py-2 text-sm   hover:bg-red-500 dark:hover:bg-neutral-800 transition"
          onClick={toggle}
        >
          close
        </Button>
        <Button
          className="w-full text-left px-4 py-2 text-sm   hover:bg-red-500 dark:hover:bg-neutral-800 transition"
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
