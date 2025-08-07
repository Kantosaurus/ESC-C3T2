"use client";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const formLoadingStates = [
  { text: "Validating information" },
  { text: "Processing data" },
  { text: "Saving to database" },
  { text: "Updating view" },
];

interface FormLoaderProps {
  loading: boolean;
  duration?: number;
}

export function FormLoader({ loading, duration = 1000 }: FormLoaderProps) {
  return (
    <MultiStepLoader
      loadingStates={formLoadingStates}
      loading={loading}
      duration={duration}
      loop={false}
    />
  );
}
