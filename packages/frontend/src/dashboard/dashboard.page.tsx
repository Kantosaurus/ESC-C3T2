import {
  Calendar,
  Users,
  Plus,
  User,
  RefreshCw,
  HeartHandshakeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCaregiver } from "@/caregiver/use-caregiver";
import { useEldersDetails } from "@/elder/use-elder-details";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "./dashboard-card";
import { ElderCard } from "./elder-card";
import { EmptyState } from "./empty-state";
import { useMemo } from "react";
import UpcomingAppointments from "./upcoming-appointments";
import AppNavbar from "@/nav/navbar";

const DashboardPage = () => {
  const { caregiverDetails } = useCaregiver();

  const {
    elderDetails,
    isLoading: eldersLoading,
    refetch: refetchElders,
  } = useEldersDetails();

  const elderNames = useMemo(() => {
    const names: Record<string, string> = {};
    elderDetails?.forEach((elder) => {
      names[elder.id] = elder.name;
    });
    return names;
  }, [elderDetails]);

  const navigate = useNavigate();

  const getGreetingByTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Morning";
    if (hours < 18) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-neutral-950">
      <AppNavbar />
      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        <div className="w-full flex flex-row items-center justify-center">
          <HeartHandshakeIcon className="inline-block mr-2 h-7 w-7" />
          <h1 className="text-3xl font-medium">
            Good {getGreetingByTime()},{" "}
            {caregiverDetails?.name.split(" ")[0] || "Caregiver"}
          </h1>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Elders"
            value={elderDetails?.length || 0}
            icon={<Users className="h-8 w-8" />}
            color="blue"
          />
          <DashboardCard
            title="Today's Tasks"
            value={0}
            icon={<Calendar className="h-8 w-8" />}
            delay={0.1}
          />
          <DashboardCard
            className="col-span-2 md:col-span-1"
            title="Care Status"
            value="Active"
            icon={<User className="h-8 w-8" />}
            delay={0.2}
          />
        </div>

        {/**Upcoming events card */}
        <UpcomingAppointments elderNames={elderNames} />

        {/* Elders List */}
        <div>
          <div className="flex justify-between items-end">
            <h2 className="font-semibold flex flex-row items-center mb-3 text-xs text-muted-foreground">
              <HeartHandshakeIcon className="inline-block mr-1 h-3 w-3" />
              Elders Under Your Care
            </h2>
            <div className="flex flex-row gap-2 mb-2">
              <Button
                size="xs"
                variant="outline"
                onClick={refetchElders}
                disabled={eldersLoading}>
                <RefreshCw
                  className={`h-2 w-2 ${eldersLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button size="xs" onClick={() => navigate("/elder/new")}>
                <Plus className="h-2 w-2" />
                Add Elder
              </Button>
            </div>
          </div>

          {elderDetails && elderDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elderDetails.map((elder, index) => (
                <ElderCard
                  key={elder.id}
                  elder={elder}
                  onClick={() => navigate(`/elder/${elder.id}/profile`)}
                  delay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No elders yet"
              description="Start by adding your first elder to begin managing their care."
              actionLabel="Add Your First Elder"
              onAction={() => navigate("/elder/new")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
