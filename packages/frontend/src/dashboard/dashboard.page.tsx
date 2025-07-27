import {
  Calendar,
  Users,
  Plus,
  User,
  LogOut,
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
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import { useState, useRef, useEffect, useMemo } from "react";
import { signOut } from "@/auth/token";
import UpcomingAppointments from "./upcoming-appointments";

const DashboardPage = () => {
  const { caregiverDetails, isLoading: caregiverLoading } = useCaregiver();
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("Dashboard - Elder Details:", elderDetails);
    console.log("Dashboard - Elders Loading:", eldersLoading);
    console.log("Dashboard - Caregiver Details:", caregiverDetails);
    console.log("Dashboard - Caregiver Loading:", caregiverLoading);
  }, [elderDetails, eldersLoading, caregiverDetails, caregiverLoading]);

  useEffect(() => {
    if (!avatarDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setAvatarDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [avatarDropdownOpen]);

  const handleLogout = async () => {
    signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Schedule", link: "#" },
    { name: "Notes", link: "/notes" },
    { name: "Calendar", link: "/calendar" },
  ];

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getGreetingByTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Morning";
    if (hours < 18) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-neutral-950">
      {/* Resizable Navbar */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center space-x-4 relative">
            {/* Avatar with dropdown */}
            <div ref={avatarRef} className="relative">
              <div
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer border-2 border-primary/80 shadow-sm"
                onClick={() => setAvatarDropdownOpen((open) => !open)}>
                {getInitials(caregiverDetails?.name)}
              </div>
              {avatarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 rounded-md shadow-lg border border-gray-200 dark:border-neutral-800 z-50 py-2">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                    onClick={() => navigate("/caregiver/profile")}>
                    <User className="h-4 w-4 mr-2 inline-block" /> Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                    onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2 inline-block" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu isOpen={mobileMenuOpen}>
            <div className="flex flex-col space-y-4 w-full">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 block mb-2">
                  Welcome, {caregiverDetails?.name}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

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
