import { useQueryBuilder } from "@/lib/http";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback } from "react";
import { useNavigate } from "react-router";

function useNewCaregiver() {
  const qb = useQueryBuilder();

  return useCallback(
    (values: CaregiverFormType) => {
      return qb()
        .then((http) => http.post("/api/caregiver/self", values))
        .then((res) => res.data)
        .catch((error) => {
          console.error("Error creating caregiver:", error);
          throw error;
        });
    },
    [qb]
  );
}

export default function NewCaregiverPage() {
  const navigate = useNavigate();
  const createNewCaregiver = useNewCaregiver();

  const handleSubmit = (values: CaregiverFormType) =>
    createNewCaregiver(values).then(() => {
      // Redirect to dashboard or show success message
      navigate("/dashboard");
    });

  return (
    <section className="p-8 mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">🎂 Caregiver Onboarding</h1>
      <p className="text-muted-foreground mb-6">
        Let us know more about you so we can better assist you in your
        caregiving journey.
      </p>
      <CaregiverForm onSubmit={handleSubmit} />
    </section>
  );
}
