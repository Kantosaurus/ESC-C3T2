import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Users,
  Plus,
  User,
  LogOut,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
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
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { askGemini } from "@/lib/gemini";

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
  const [showChat, setShowChat] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string; timestamp: number }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async (initialMessage?: string) => {
    const question = (initialMessage ?? inputValue).trim();
    if (!question) return;
    setMessages((msgs) => [
      ...msgs,
      { role: "user", text: question, timestamp: Date.now() },
    ]);
    if (!initialMessage) setInputValue("");
    setChatLoading(true);
    try {
      const answer = await askGemini(question);
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: answer, timestamp: Date.now() },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "ai",
          text: "Sorry, there was an error contacting Gemini.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !chatLoading) {
      handleSend();
    }
  };

  const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Schedule", link: "#" },
    { name: "Notes", link: "#" },
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

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {showChat ? (
        <div className="flex flex-col min-h-screen w-full bg-gray-50">
          {/* On entering chat, if pendingMessage exists, add it as first message and trigger Gemini */}
          {pendingMessage &&
            messages.length === 0 &&
            (() => {
              handleSend(pendingMessage);
              setPendingMessage(null);
              return null;
            })()}
          <button
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white shadow text-gray-700 font-medium transition z-20 border border-gray-200"
            onClick={() => setShowChat(false)}
            style={{ backdropFilter: "blur(8px)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div
            className={`flex-1 flex flex-col items-center ${
              messages.length <= 2
                ? "justify-center"
                : "justify-end overflow-y-auto"
            } pb-32 pt-12 px-2 sm:px-0`}
          >
            <div
              className={`w-full max-w-2xl mx-auto flex flex-col gap-4 ${
                messages.length <= 2
                  ? "min-h-[60vh] flex flex-col justify-center"
                  : ""
              }`}
            >
              <div className="text-center text-2xl font-semibold text-gray-900 tracking-tight mb-4">
                Gemini AI
              </div>
              {messages.length === 0 && !chatLoading && (
                <div className="text-center text-gray-400 text-base mb-4">
                  Hi there! How can I assist you today?
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end gap-2"
                        : "justify-start gap-4"
                    } w-full`}
                  >
                    {msg.role === "ai" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                        🤖
                      </div>
                    )}
                    <div
                      className={
                        msg.role === "user"
                          ? "flex flex-col items-end"
                          : "flex flex-col items-start"
                      }
                    >
                      <div
                        className={
                          msg.role === "user"
                            ? "bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-[80vw] sm:max-w-[80%] text-base shadow-sm"
                            : "bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl max-w-[80vw] sm:max-w-[80%] text-base shadow-sm border border-gray-200"
                        }
                      >
                        {msg.text}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.role === "user"
                            ? "text-blue-400"
                            : "text-gray-400"
                        }`}
                        style={{ minWidth: "4rem" }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold ml-2">
                        <span role="img" aria-label="User">
                          🧑
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-2xl max-w-[80%] text-base shadow-sm border border-gray-200">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </div>
          <form
            className="fixed bottom-0 left-0 max-w-2xl mx-auto w-full right-0 flex justify-center bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pt-6 pb-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            autoComplete="off"
            style={{ left: "0", right: "0" }}
          >
            <div className="flex items-center gap-2 px-2 w-full">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500 hover:border-blue-400"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={chatLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-full px-6 py-3 font-semibold shadow-sm hover:bg-blue-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={chatLoading || !inputValue.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
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
                    onClick={() => setAvatarDropdownOpen((open) => !open)}
                  >
                    {getInitials(caregiverDetails?.name)}
                  </div>
                  {avatarDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 rounded-md shadow-lg border border-gray-200 dark:border-neutral-800 z-50 py-2">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                        onClick={() => navigate("/caregiver/profile")}
                      >
                        <User className="h-4 w-4 mr-2 inline-block" /> Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                        onClick={handleLogout}
                      >
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
                      onClick={() => setMobileMenuOpen(false)}
                    >
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
                      className="flex items-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
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
            {/* Greeting and Profile Card */}
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Greeting Section */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {getTimeBasedGreeting()}, {caregiverDetails?.name}!
                </h2>
                <p className="text-gray-600 text-lg mb-6 max-w-2xl">
                  This is your AI assistant. Ask any question about caregiving,
                  elders, or using the platform in the box below!
                </p>
                {/* PlaceholdersAndVanishInput below greeting */}
                <div className="w-full max-w-xl">
                  <PlaceholdersAndVanishInput
                    placeholders={[
                      "How can I help my elder today?",
                      "What tasks do I need to complete?",
                      "How do I add a new elder?",
                      "Tips for better caregiving?",
                      "How to contact support?",
                    ]}
                    onChange={() => {}}
                    // @ts-expect-error PlaceholdersAndVanishInput does not officially support inputRef prop
                    inputRef={inputRef}
                    onSubmit={() => {
                      if (inputRef.current && inputRef.current.value) {
                        setPendingMessage(inputRef.current.value);
                        setShowChat(true);
                      }
                    }}
                    onVanishComplete={undefined}
                  />
                </div>
              </div>
              {/* Profile Overview Card removed */}
            </div>
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
                    disabled={eldersLoading}
                  >
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
              className="mt-8"
            >
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
        </>
      )}
    </div>
  );
};

export default DashboardPage;
