import { http } from "@/lib/http";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback } from "react";
import { useAfter } from "@/lib/use-after";

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
  const createNewCaregiver = useNewCaregiver();
  const after = useAfter();

  const handleSubmit = useCallback(
    (values: CaregiverFormType) =>
      createNewCaregiver(values).then(() => {
        after();
      }),
    [after, createNewCaregiver]
  );

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
