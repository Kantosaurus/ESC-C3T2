import { useTest } from "@/test";
import { UserButton } from "@clerk/clerk-react";

export default function DashboardPage() {
  const { msg } = useTest();
  return (
    <div>
      {/* TODO: Dashboard Page */}
      <UserButton />
      {msg}
    </div>
  );
}
