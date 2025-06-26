import { http } from "@/lib/http";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback } from "react";
import { useNavigate } from "react-router";

function useNewCaregiver() {
  return useCallback((values: CaregiverFormType) => {
    return http()
      .post("/api/caregiver/self", values)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error creating caregiver:", error);
        throw error;
      });
  }, []);
}

export default function NewCaregiverPage() {
  const navigate = useNavigate();
  const createNewCaregiver = useNewCaregiver();

  const handleSubmit = (values: CaregiverFormType) =>
    createNewCaregiver(values).then(() => {
      // Redirect to dashboard or show success message
      navigate("/elder/new");
    });

  return (
    <>
      <section className="bg-teal-100 text-teal-800">
        <div className="mx-auto max-w-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">🏃‍♂️ New Caregiver Profile</h1>
          <p>
            Let us know more about you so we can better assist you in your
            caregiving journey.
          </p>
        </div>
      </section>

      <section className="p-8 mx-auto max-w-2xl">
        <CaregiverForm onSubmit={handleSubmit} />
      </section>
    </>
  );
}
