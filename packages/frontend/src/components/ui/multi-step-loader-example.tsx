"use client";
import { useState } from "react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

// Example loading states for calendar import
const calendarImportStates = [
  {
    text: "Reading calendar file",
  },
  {
    text: "Parsing events",
  },
  {
    text: "Validating appointments",
  },
  {
    text: "Checking for conflicts",
  },
  {
    text: "Saving to database",
  },
  {
    text: "Updating calendar view",
  },
  {
    text: "Import complete!",
  },
];

export function CalendarImportExample() {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);

    // Simulate import process
    setTimeout(() => {
      setLoading(false);
    }, 14000); // 14 seconds total (7 states × 2 seconds each)
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleImport}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Import Calendar
      </Button>

      <MultiStepLoader
        loadingStates={calendarImportStates}
        loading={loading}
        duration={2000}
        loop={false}
      />
    </div>
  );
}
