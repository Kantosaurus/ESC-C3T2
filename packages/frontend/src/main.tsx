import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import LandingPage from "./landing/landing.page.tsx";
import LoginPage from "./auth/login.page.tsx";
import RedirectPage from "./auth/redirect.page.tsx";
import DashboardPage from "./dashboard/dashboard.page.tsx";
import NewElderPage from "./elder/new-elder-page.tsx";
import EditElderPage from "./elder/edit-elder-page.tsx";
import { ElderProfilePage } from "./elder/profile.page.tsx";
import NewCaregiverPage from "./caregiver/new-caregiver.page.tsx";
import CaregiverProfilePage from "./caregiver/profile.page.tsx";
import CalendarPage from "./calendar/calendar.page.tsx";
import NewNotePage from "./note/new-note.page.tsx";
import EditNotePage from "./note/edit-note.page.tsx";
import NotesPage from "./note/notes.page.tsx";
import { InvitePage } from "./elder/invite.page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/redirect",
    element: <RedirectPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/elder/new",
    element: <NewElderPage />,
  },
  {
    path: "/elder/:elderId/profile",
    element: <ElderProfilePage />,
  },
  {
    path: "/elder/:elderId/edit",
    element: <EditElderPage />,
  },
  {
    path: "/elder/:elderId/appointments",
    element: <CalendarPage />,
  },
  {
    path: "/elder/:elderId/invite",
    element: <InvitePage />,
  },
  {
    path: "/caregiver/new",
    element: <NewCaregiverPage />,
  },
  {
    path: "/caregiver/profile",
    element: <CaregiverProfilePage />,
  },
  {
    path: "/calendar",
    element: <CalendarPage />,
  },
  {
    path: "/note/new",
    element: <NewNotePage />,
  },
  {
    path: "/note/:noteId/edit",
    element: <EditNotePage />,
  },
  {
    path: "/notes",
    element: <NotesPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>
);
