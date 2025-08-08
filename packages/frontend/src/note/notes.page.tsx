import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { NoteDetails } from "./use-notes-data";
import { useEldersDetails } from "@/elder/use-elder-details";
import { PageLoader } from "@/components/ui/page-loader";
import AppNavbar from "@/nav/navbar";
import { Plus, FileText } from "lucide-react";

export default function NotesPage() {
  const { elderDetails, isLoading: eldersLoading } = useEldersDetails();

  if (eldersLoading) {
    return <PageLoader loading={true} pageType="notes" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <AppNavbar />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and organize your care notes
              </p>
            </div>
          </div>

          {elderDetails && elderDetails.length > 0 && (
            <Link to="/notes/new">
              <Button
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <NoteDetails />
      </div>
    </div>
  );
}
