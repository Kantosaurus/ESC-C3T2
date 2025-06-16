import { useCaregiver } from "@/caregiver/use-caregiver";
import { UserButton } from "@clerk/clerk-react";

export default function DashboardPage() {
  const { caregiverDetails } = useCaregiver();
  return (
    <div>
      {/* TODO: Dashboard Page */}
      <UserButton />
      <pre>{JSON.stringify(caregiverDetails, null, 2)}</pre>
    </div>
  );
}
//
