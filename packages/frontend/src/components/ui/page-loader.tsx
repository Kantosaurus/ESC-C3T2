"use client";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

// Loading states for different page types
const dashboardLoadingStates = [
  { text: "Loading your profile" },
  { text: "Fetching elder information" },
  { text: "Getting upcoming appointments" },
  { text: "Preparing dashboard" },
];

const profileLoadingStates = [
  { text: "Loading profile data" },
  { text: "Fetching personal information" },
  { text: "Getting appointment history" },
  { text: "Preparing profile view" },
];

const calendarLoadingStates = [
  { text: "Loading calendar" },
  { text: "Fetching appointments" },
  { text: "Getting elder details" },
  { text: "Preparing calendar view" },
];

const elderProfileLoadingStates = [
  { text: "Loading elder profile" },
  { text: "Fetching personal details" },
  { text: "Getting care information" },
  { text: "Preparing profile view" },
];

const notesLoadingStates = [
  { text: "Loading notes" },
  { text: "Fetching note history" },
  { text: "Getting elder associations" },
  { text: "Preparing notes view" },
];

const formLoadingStates = [
  { text: "Validating information" },
  { text: "Processing data" },
  { text: "Saving to database" },
  { text: "Updating view" },
];

const importLoadingStates = [
  { text: "Reading calendar file" },
  { text: "Parsing events" },
  { text: "Validating appointments" },
  { text: "Checking for conflicts" },
  { text: "Saving to database" },
  { text: "Updating calendar view" },
  { text: "Import complete!" },
];

type PageType =
  | "dashboard"
  | "profile"
  | "calendar"
  | "elder-profile"
  | "notes"
  | "form"
  | "import";

interface PageLoaderProps {
  loading: boolean;
  pageType: PageType;
  duration?: number;
  loop?: boolean;
}

export function PageLoader({
  loading,
  pageType,
  duration = 1500,
  loop = false,
}: PageLoaderProps) {
  const getLoadingStates = (type: PageType) => {
    switch (type) {
      case "dashboard":
        return dashboardLoadingStates;
      case "profile":
        return profileLoadingStates;
      case "calendar":
        return calendarLoadingStates;
      case "elder-profile":
        return elderProfileLoadingStates;
      case "notes":
        return notesLoadingStates;
      case "form":
        return formLoadingStates;
      case "import":
        return importLoadingStates;
      default:
        return dashboardLoadingStates;
    }
  };

  const loadingStates = getLoadingStates(pageType);

  return (
    <MultiStepLoader
      loadingStates={loadingStates}
      loading={loading}
      duration={duration}
      loop={loop}
    />
  );
}
