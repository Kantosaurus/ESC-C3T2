import { http } from "@/lib/http";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback } from "react";
import NewForm from "@/components/ui/new-form";
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
    [createNewCaregiver, after]
  );

  return (
    <NewForm
      title="Create Your Caregiver Profile"
      description="Let's create your profile so we can provide you with the best support and resources for your caregiving role."
      body={<CaregiverForm onSubmit={handleSubmit} />}
    />
  );
}
