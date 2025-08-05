import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteNote } from "./use-delete-node";
import { Button } from "@/components/ui/button";
import type { Note } from "@carely/core";
import { Edit, Trash2, X, Calendar, Clock, User } from "lucide-react";
import type { Elder } from "@carely/core";

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={toggle}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Note Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage note information
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Note Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {note.header}
            </h3>
            <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>

          {/* Note Content */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span className="font-medium">Assigned to:</span>
                <span className="text-gray-900 dark:text-white">
                  {elderDetails.find((e) => e.id === note.assigned_elder_id)
                    ?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(note.created_at).toLocaleDateString("en-GB")} at{" "}
                  {new Date(note.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Updated:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(note.updated_at).toLocaleDateString("en-GB")} at{" "}
                  {new Date(note.updated_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <Button
            variant="outline"
            onClick={toggle}
            className="flex-1 sm:flex-none gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
          <Button
            onClick={() => navigate("/notes/edit", { state: { note } })}
            className="flex-1 sm:flex-none gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Note
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteNote}
            className="flex-1 sm:flex-none gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Note
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
