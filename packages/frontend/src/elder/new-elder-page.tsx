import { http } from "@/lib/http";
import { ElderForm, type ElderFormType } from "./elder.form";
import { useNavigate } from "react-router";
import type { NewElderDto } from "@carely/core";

const addNewElder = (values: NewElderDto) =>
  http()
    .post("/api/elder/new", values)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error creating elder:", error);
      throw error;
    });

export default function NewElderPage() {
  const navigate = useNavigate();
  const handleSubmit = async (values: ElderFormType) => {
    await addNewElder(values);
    // Redirect to elder details page or show success message
    navigate("/dashboard");
  };

  return (
    <>
      <section className="bg-indigo-100 text-indigo-800">
        <div className="p-8 mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">👴 New Elder Profile</h1>{" "}
          <p>
            Please provide the details of the elder you are caring for. This
            will help us tailor our services to their needs.
          </p>
        </div>
      </section>

      <section className="p-8 mx-auto max-w-2xl">
        <ElderForm onSubmit={handleSubmit} />
      </section>
    </>
  );
}
