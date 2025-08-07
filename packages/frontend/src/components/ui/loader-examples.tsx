"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { FormLoader } from "@/components/ui/form-loader";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

// Custom loading states for different scenarios
const customLoadingStates = [
  { text: "Initializing application" },
  { text: "Loading user preferences" },
  { text: "Syncing data" },
  { text: "Ready to go!" },
];

export function LoaderExamples() {
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  const simulateLoading = (
    setter: (loading: boolean) => void,
    duration: number
  ) => {
    setter(true);
    setTimeout(() => setter(false), duration);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Multi-Step Loader Examples
      </h1>

      {/* Dashboard Loading Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dashboard Loading</h2>
        <Button onClick={() => simulateLoading(setDashboardLoading, 6000)}>
          Simulate Dashboard Load
        </Button>
        <PageLoader loading={dashboardLoading} pageType="dashboard" />
      </div>

      {/* Profile Loading Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Profile Loading</h2>
        <Button onClick={() => simulateLoading(setProfileLoading, 6000)}>
          Simulate Profile Load
        </Button>
        <PageLoader loading={profileLoading} pageType="profile" />
      </div>

      {/* Calendar Loading Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Calendar Loading</h2>
        <Button onClick={() => simulateLoading(setCalendarLoading, 6000)}>
          Simulate Calendar Load
        </Button>
        <PageLoader loading={calendarLoading} pageType="calendar" />
      </div>

      {/* Form Loading Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Form Submission Loading</h2>
        <Button onClick={() => simulateLoading(setFormLoading, 4000)}>
          Simulate Form Submit
        </Button>
        <FormLoader loading={formLoading} />
      </div>

      {/* Custom Loading Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Custom Loading States</h2>
        <Button onClick={() => simulateLoading(setCustomLoading, 8000)}>
          Simulate Custom Process
        </Button>
        <MultiStepLoader
          loadingStates={customLoadingStates}
          loading={customLoading}
          duration={2000}
          loop={false}
        />
      </div>

      {/* Usage Instructions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Usage Instructions</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>PageLoader:</strong> Use for page-level loading states
          </p>
          <p>
            <strong>FormLoader:</strong> Use for form submission loading
          </p>
          <p>
            <strong>MultiStepLoader:</strong> Use for custom loading processes
          </p>
          <p>
            <strong>Duration:</strong> Time per step (default: 1500ms for pages,
            1000ms for forms)
          </p>
          <p>
            <strong>Loop:</strong> Whether to repeat the loading sequence
          </p>
        </div>
      </div>
    </div>
  );
}
