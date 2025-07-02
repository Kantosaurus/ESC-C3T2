import { http } from "@/lib/http";
import { CaregiverForm, type CaregiverFormType } from "./caregiver.form";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

function useNewCaregiver() {
  return useCallback((values: CaregiverFormType) => {
    return http()
      .post("/api/caregiver/self", values)
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error creating caregiver:", error);
        throw error;
      });
  }, []);
}

export default function NewCaregiverPage() {
  const [isVisible, setIsVisible] = useState(false);
  const createNewCaregiver = useNewCaregiver();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(
    (values: CaregiverFormType) =>
      createNewCaregiver(values).then(() => {
        navigate("/dashboard");
      }),
    [navigate, createNewCaregiver]
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div
          className={`relative mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24 transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="text-center">
            <div
              className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-700 ease-out ${
                isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
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
              style={{ transitionDelay: "300ms" }}
            >
              Welcome to Your Caregiving Journey
            </h1>
            <p
              className={`mt-6 text-xl text-blue-100 max-w-2xl mx-auto transition-all duration-700 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              Let's create your profile so we can provide you with the best
              support and resources for your caregiving role.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-all duration-1500 ease-out ${
              isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          ></div>
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-all duration-1500 ease-out ${
              isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            style={{ transitionDelay: "700ms" }}
          ></div>
        </div>
      </div>

      {/* Form Section */}
      <div
        className={`relative -mt-8 mx-auto max-w-2xl px-6 pb-16 sm:px-8 transition-all duration-1000 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 sm:p-10 hover:shadow-2xl transition-all duration-500 ease-out">
          <div
            className={`mb-8 transition-all duration-700 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Profile Details
            </h2>
            <p className="text-gray-600">
              Please provide your information below. We'll use this to
              personalize your experience.
            </p>
          </div>

          <CaregiverForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
