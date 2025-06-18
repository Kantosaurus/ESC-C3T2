import { signOut } from "@/auth/token";
import { useCaregiver } from "@/caregiver/use-caregiver";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { caregiverDetails } = useCaregiver();
  return (
    <div>
      <pre>{JSON.stringify(caregiverDetails, null, 2)}</pre>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
}
