import { Button } from "@/components/ui/button";
import { Link } from "react-router";
// import { NoteComponent } from "@/components/ui/note-component";
import { NoteDetails } from "./use-notes-data";
import { useEldersDetails } from "@/elder/use-elder-details";
import AppNavbar from "@/nav/navbar";

export default function NotesPage() {
  const { elderDetails, isLoading: eldersLoading } = useEldersDetails();

  if (eldersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-neutral-950">
        <AppNavbar />
        <section className="text-indigo-900">
          <div className="p-8 mx-auto max-w-2xl flex justify-between items-center"></div>
        </section>
        <section className="p-2 mx-auto max-w-3xl">
          <div className="p-8 mx-auto max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Notes List</h1>
              {elderDetails && elderDetails.length > 0 && (
                <Link to="/notes/new">
                  <Button size="lg">Add New Note</Button>
                </Link>
              )}
            </div>
            <NoteDetails />
          </div>
        </section>
      </div>
    </>
  );
}
