import { Button } from "@/components/ui/button";
import { Link } from "react-router";
// import { NoteComponent } from "@/components/ui/note-component";
import { NoteDetails } from "./use-notes-data";

export default function NotesPage() {

  return (
    <>
      <section className="bg-indigo-100 text-indigo-900">
        <div className="p-8 mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">📝My Notes</h1>
        </div>
      </section>
      <Link to="/notes/new">
        <Button size="lg">Add New Note</Button>
      </Link>
      <section className="p-2 mx-auto max-w-2xl">
        {/* <NoteComponent /> */}
        <NoteDetails />
      </section>
    </>
  );
}
