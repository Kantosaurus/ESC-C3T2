import { Button } from "@/components/ui/button";
import { Link } from "react-router";
// import { NoteComponent } from "@/components/ui/note-component";
import { NoteDetails } from "./use-notes-data";
import { useEldersDetails } from "@/elder/use-elder-details";
import {  User, LogOut } from "lucide-react";
import { useCaregiver } from "@/caregiver/use-caregiver";
import { useNavigate } from "react-router-dom";
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

export default function NotesPage() {
  const { elderDetails, isLoading: eldersLoading } = useEldersDetails();
  const { caregiverDetails } = useCaregiver();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

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
  ];

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (eldersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
        <section className="text-indigo-900">
          <div className="p-8 mx-auto max-w-2xl flex justify-between items-center">
          </div>
        </section>
        <section className="p-2 mx-auto max-w-3xl">
          <div className="p-8 mx-auto max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Notes List</h1>
              {elderDetails && elderDetails.length > 0 && (
                <Link to="/notes/new">
                  <Button size="lg">Add New Note</Button>
                </Link>
              )}
            </div>
            <NoteDetails />
          </div>
        </section>
      </div>
    </>
  );
}