import { http } from "@/lib/http";
//import { AddNoteForm } from "./add-note.form";
import { AddNoteForm, type AddNoteFormType } from "./add-note.form";
import { useNavigate } from "react-router";
import type { NewNotesDto } from "@carely/core";

const addNewNote = (values: NewNotesDto) =>
   http()
     .post("/api/notes/new", values)
     .then((res) => res.data)
     .catch((error) => {
       console.error("Error creating note:", error);
       throw error;
     });

export default function NewNotePage() {
    const navigate = useNavigate();
    //const handleSubmit = async () => {
    const handleSubmit = async (values: AddNoteFormType) => {
        await addNewNote(values);
        // TODO: Handle form submission of data and link to backend API db
        navigate("/notes");
    };

    return (
        <>
            <section className="bg-indigo-100 text-indigo-800">
                <div className="p-8 mx-auto max-w-2xl">
                    <h1 className="text-2xl font-bold mb-2">Add New Note</h1>
                    <p>
                        Add in details for reminders, tasks, or any other notes you want to keep track of.
                    </p>
                </div>
            </section>

            <section className="p-8 mx-auto max-w-2xl">

                <AddNoteForm onSubmit={handleSubmit} />
            </section>
        </>
    );
}
