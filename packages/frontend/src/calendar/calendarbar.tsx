import { Button } from "@/components/ui/button";
import type { Appointment, Elder } from "@carely/core";
import { Download, Inbox, Clock, Search, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAppointments,
  useGetDeclinedAppointments,
  useGetPendingAppointments,
} from "./use-appointment";
import { useEldersDetails } from "@/elder/use-elder-details";
import useCreateIcsFile from "./exportics";

export default function CalendarBar({
  selectedElder,
  goToToday,
}: {
  selectedElder: Elder | null;
  goToToday: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { elderDetails } = useEldersDetails();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const { appointments } = useGetAppointments(selectedElder?.id ?? null);
  const [showPending, setShowPending] = useState(false);
  const { triggerDownload } = useCreateIcsFile(appointments);
  const { declined } = useGetDeclinedAppointments(selectedElder?.id ?? null);

  const { pending, refetchPending } = useGetPendingAppointments();

  // check screen width
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (pending) {
      setPendingAppointments(pending);
    }
  }, [pending]);

  useEffect(() => {
    if (!appointments || searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = appointments.filter(
      (appt) =>
        appt.name.toLowerCase().includes(query) ||
        (appt.details?.toLowerCase().includes(query) ?? false)
    );
    setSearchResults(filtered);
  }, [searchQuery, appointments]);

  const showAppointmentDetails = (appointment: Appointment) => {
    const elder = elderDetails?.find((e) => e.id === appointment.elder_id);
    if (elder) {
      navigate(`/calendar/${elder.id}/${appointment.appt_id}`, {
        replace: true,
      });
    }
  };

  const handlePendingToggle = () => {
    setShowPending((prev) => !prev);
    refetchPending();
  };

  //big version
  if (!isMobile) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-56
               bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            {searchResults.length > 0 && (
              <div
                className="absolute right-0
                mt-2 w-80 bg-white shadow-xl border border-slate-200 rounded-xl z-50 overflow-hidden"
              >
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-medium text-slate-900">
                    Search Results ({searchResults.length})
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={`${result.startDateTime}-${result.name}`}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery("");
                        showAppointmentDetails(result);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {declined?.some(
                          (item) => item.appt_id === result.appt_id
                        ) ? (
                          <div className="text-2xl font-semibold text-red-500 -mt-1 flex-shrink-0">
                            !
                          </div>
                        ) : (
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {result.name}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              result.startDateTime
                            ).toLocaleDateString()}{" "}
                            –{" "}
                            {new Date(result.startDateTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {selectedElder?.id && (
          <Button variant="outline" onClick={() => triggerDownload()}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
        <div className="relative">
          <Button
            onClick={handlePendingToggle}
            variant="outline"
            className="relative bg-white hover:bg-slate-50 border-slate-200"
          >
            <Inbox className="w-4 h-4 mr-2" /> Pending
            {pendingAppointments.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingAppointments.length}
              </span>
            )}
          </Button>
          {showPending && (
            <div className="absolute mt-2 w-80 right-0 bg-white shadow-xl border border-slate-200 rounded-xl z-50 overflow-hidden">
              {pendingAppointments.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-sm font-medium text-slate-900">
                      Pending Appointments ({pendingAppointments.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingAppointments.map((result) => (
                      <div
                        key={result.appt_id}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          showAppointmentDetails(result);
                          setSearchQuery("");
                          setShowPending(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {declined?.some(
                            (item) => item.appt_id === result.appt_id
                          ) ? (
                            <div className="text-2xl font-semibold text-red-500 -mt-1 flex-shrink-0">
                              !
                            </div>
                          ) : (
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">
                              {result.name}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              for{" "}
                              {
                                elderDetails?.find(
                                  (elder) => elder.id === result.elder_id
                                )?.name
                              }
                            </div>
                            {result.startDateTime && (
                              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(
                                  result.startDateTime
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-slate-500 text-sm font-medium">
                    No pending appointments
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    All appointments are accepted
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={goToToday}
          className="bg-white hover:bg-slate-50 border-slate-200"
        >
          Today
        </Button>
      </div>
    );
  }

  //smol version
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="bg-white hover:bg-slate-50 border-slate-200 relative"
      >
        <Menu className="w-4 h-4" />
        {pendingAppointments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {pendingAppointments.length}
          </span>
        )}
      </Button>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 max-w-svw top-full h-dvh flex flex-col shadow-xl border border-slate-200">
          <div className="flex flex-col space-y-1 p-4">
            <div className="w-full mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Appointments
              </label>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                {searchResults.length > 0 && (
                  <div className="absolute left-0 mt-2 w-full bg-white shadow-xl border border-slate-200 rounded-xl z-50 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-sm font-medium text-slate-900">
                        Search Results ({searchResults.length})
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.startDateTime}-${result.name}`}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                          onClick={() => {
                            setSearchQuery("");
                            showAppointmentDetails(result);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {declined?.some(
                              (item) => item.appt_id === result.appt_id
                            ) ? (
                              <div className="text-2xl font-semibold text-red-500 -mt-1 flex-shrink-0">
                                !
                              </div>
                            ) : (
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 truncate">
                                {result.name}
                              </div>
                              <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(
                                  result.startDateTime
                                ).toLocaleDateString()}{" "}
                                –{" "}
                                {new Date(
                                  result.startDateTime
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedElder?.id && (
              <Button
                variant="outline"
                onClick={() => {
                  triggerDownload();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Calendar
              </Button>
            )}
            <div className="w-full">
              <div className="relative">
                <Button
                  onClick={handlePendingToggle}
                  variant="outline"
                  size="sm"
                  className="relative bg-white hover:bg-slate-50 border-slate-200 w-full justify-start"
                >
                  <Inbox className="w-4 h-4 mr-2" />
                  Pending
                  {pendingAppointments.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingAppointments.length}
                    </span>
                  )}
                </Button>

                {showPending && (
                  <div className="absolute left-0 mt-2 w-full bg-white shadow-xl border border-slate-200 rounded-xl z-50 overflow-hidden">
                    {pendingAppointments.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="text-sm font-medium text-slate-900">
                            Pending Appointments ({pendingAppointments.length})
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {pendingAppointments.map((result) => (
                            <div
                              key={result.appt_id}
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                              onClick={() => {
                                showAppointmentDetails(result);
                                setSearchQuery("");
                                setShowPending(false);
                                setMobileMenuOpen(false);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                {declined?.some(
                                  (item) => item.appt_id === result.appt_id
                                ) ? (
                                  <div className="text-2xl font-semibold text-red-500 -mt-1 flex-shrink-0">
                                    !
                                  </div>
                                ) : (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 truncate">
                                    {result.name}
                                  </div>
                                  <div className="text-sm text-slate-500 mt-1">
                                    for{" "}
                                    {
                                      elderDetails?.find(
                                        (elder) => elder.id === result.elder_id
                                      )?.name
                                    }
                                  </div>
                                  {result.startDateTime && (
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(
                                        result.startDateTime
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-slate-500 text-sm font-medium">
                          No pending appointments
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          All appointments are accepted
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                goToToday();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start bg-white hover:bg-slate-50 border-slate-200"
            >
              <Clock className="w-4 h-4 mr-2" />
              Go to Today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
