import { signOut } from "@/auth/token";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "./use-dashboard-data";
import { Link } from "react-router";

export default function DashboardPage() {
  const { caregiverDetails, elderDetails } = useDashboardData();
  return (
    <div>
      <pre>{JSON.stringify(caregiverDetails, null, 2)}</pre>
      <pre>{JSON.stringify(elderDetails, null, 2)}</pre>
      <div>
        {elderDetails?.map((elderDetail) => (
          <Link key={elderDetail.id} to={`/elder/${elderDetail.id}/invite`}>
            Invite other caregivers for {elderDetail.name}
          </Link>
        ))}
      </div>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
}
