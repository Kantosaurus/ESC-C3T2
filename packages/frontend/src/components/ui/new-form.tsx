import React, { useEffect, useState } from "react";
import Card from "./card";

export type NewFormProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  body?: React.ReactNode;
};

export default function NewForm({ title, description, body }: NewFormProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary">
        <div
          className={`relative mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24 transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}>
          <div className="text-center">
            <div
              className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-700 ease-out ${
                isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}>
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1
              className={`text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl transition-all duration-700 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "300ms" }}>
              {title}
            </h1>
            <p
              className={`mt-6 text-xl text-blue-100 max-w-2xl mx-auto transition-all duration-700 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}>
              {description}
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-all duration-1500 ease-out ${
              isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}></div>
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-all duration-1500 ease-out ${
              isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            style={{ transitionDelay: "700ms" }}></div>
        </div>
      </div>
      <Card className="max-w-2xl mx-auto -mt-8 z-10 relative">{body}</Card>
    </div>
  );
}
