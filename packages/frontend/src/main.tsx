import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { RouteGuard } from "@/components/authenticated-route.tsx";
import LoginPage from "./auth/login.page.tsx";
import DashboardPage from "./dashboard/dashboard.page.tsx";
import NewCaregiverPage from "./caregiver/new-caregiver.page.tsx";
import RedirectPage from "./auth/redirect.page.tsx";
import LandingPage from "./landing/landing.page.tsx";
import NewElderPage from "./elder/new-elder-page.tsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/redirect" element={<RedirectPage />} />
        <Route element={<RouteGuard />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/caregiver/new" element={<NewCaregiverPage />} />
          <Route path="/elder/new" element={<NewElderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
