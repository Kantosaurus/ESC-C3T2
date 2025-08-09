import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RouteGuard } from "@/components/authenticated-route.tsx";
import LoginPage from "./auth/login.page.tsx";
import DashboardPage from "./dashboard/dashboard.page.tsx";
import NewCaregiverPage from "./caregiver/new-caregiver.page.tsx";
import RedirectPage from "./auth/redirect.page.tsx";
import LandingPage from "./landing/landing.page.tsx";
import NewElderPage from "./elder/new-elder-page.tsx";
import CalendarPage from "./calendar/calendar.page.tsx";
import { AcceptInvitePage, InvitePage } from "./elder/invite.page.tsx";
import ElderProfilePage from "./elder/profile.page.tsx";
import EditElderPage from "./elder/edit-elder-page.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import ProfilePage from "./caregiver/profile.page.tsx";
import CaregiverProfilePage from "./caregiver/caregiver-profile.page.tsx";
import NotesPage from "./note/notes.page.tsx";
import NewNotePage from "./note/new-note.page.tsx";
import EditNotePage from "./note/edit-note.page.tsx";
import AIPage from "./ai/ai.page.tsx";

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
          <Route path="/caregiver/profile" element={<ProfilePage />} />
          <Route
            path="/caregiver/:caregiverId"
            element={<CaregiverProfilePage />}
          />
          <Route path="/elder/new" element={<NewElderPage />} />
          <Route
            path="/elder/:elderId/profile"
            element={<ElderProfilePage />}
          />
          <Route path="/elder/:elderId/edit" element={<EditElderPage />} />
          <Route path="/elder/:id/invite" element={<InvitePage />} />
          <Route path="/invite" element={<AcceptInvitePage />} />

          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/new" element={<NewNotePage />} />
          <Route path="/notes/:id/edit" element={<EditNotePage />} />

          <Route path="/calendar" element={<CalendarPage />} />
          <Route
            path="/calendar/:elder_id/:appt_id"
            element={<CalendarPage />}
          />
          <Route path="/calendar/:elder_id" element={<CalendarPage />} />
          <Route path="/ai" element={<AIPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster />
  </StrictMode>
);
