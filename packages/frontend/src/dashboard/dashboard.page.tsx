import { signOut } from "@/auth/token";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "./use-dashboard-data";

export default function DashboardPage() {
  const { caregiverDetails, elderDetails } = useDashboardData();
  return (
    <div>
      <pre>{JSON.stringify(caregiverDetails, null, 2)}</pre>
      <pre>{JSON.stringify(elderDetails, null, 2)}</pre>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
}
