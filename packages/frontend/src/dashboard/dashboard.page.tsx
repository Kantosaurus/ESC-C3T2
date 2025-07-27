import { motion } from "motion/react";
import { Calendar, Users, Plus, User, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCaregiver } from "@/caregiver/use-caregiver";
import { useEldersDetails } from "@/elder/use-elder-details";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "./dashboard-card";
import { ElderCard } from "./elder-card";
import { EmptyState } from "./empty-state";
import { FocusBento } from "@/components/ui/focus-bento";
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
import { useState, useRef, useEffect } from "react";
import { signOut } from "@/auth/token";
import Card from "@/components/ui/card";

const DashboardPage = () => {
  const { caregiverDetails, isLoading: caregiverLoading } = useCaregiver();
  const {
    elderDetails,
    isLoading: eldersLoading,
    refetch: refetchElders,
  } = useEldersDetails();
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

  const focusBentoCards = [
    {
      title: "Guidebook",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center",
      description: "Essential caregiving guidelines and best practices",
      className: "md:col-span-2 md:row-span-2",
    },
    {
      title: "Transcription",
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=center",
      description: "Convert voice notes to text for better documentation",
      className: "md:col-span-1 md:row-span-1",
    },
    {
      title: "Notes",
      src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center",
      description: "Keep track of important care notes and observations",
      className: "md:col-span-1 md:row-span-2",
    },
    {
      title: "Training",
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center",
      description: "Enhance your caregiving skills with professional training",
      className: "md:col-span-2 md:row-span-1",
    },
    {
      title: "Counselling",
      src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&crop=center",
      description: "Get emotional support and professional counselling",
      className: "md:col-span-1 md:row-span-1",
    },
    {
      title: "IM-OK",
      src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center",
      description: "Quick health status check and emergency alerts",
      className: "md:col-span-2 md:row-span-1",
    },
  ];

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
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
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            color="green"
            delay={0.1}
          />
          <DashboardCard
            title="Care Status"
            value="Active"
            icon={<User className="h-8 w-8" />}
            color="purple"
            delay={0.2}
          />
        </div>

        {/* Elders List */}
        <Card delay={0.4}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Elders
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refetchElders}
                disabled={eldersLoading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    eldersLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
              <Button size="sm" onClick={() => navigate("/elder/new")}>
                <Plus className="h-4 w-4 mr-2" />
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
        </Card>

        {/* Focus Bento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Care Resources
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Access essential tools and resources for better caregiving
            </p>
          </div>
          <FocusBento cards={focusBentoCards} />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
