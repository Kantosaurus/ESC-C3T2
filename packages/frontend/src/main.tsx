import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes } from "react-router";
import { RouteGuard } from "@/components/authenticated-route.tsx";
import LoginPage from "./auth/login.page.tsx";
import DashboardPage from "./dashboard/dashboard.page.tsx";
import NewCaregiverPage from "./caregiver/new-caregiver.page.tsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RouteGuard />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/caregiver/new" element={<NewCaregiverPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
