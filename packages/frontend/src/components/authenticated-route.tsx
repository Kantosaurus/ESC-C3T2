import { isTokenValid } from "@/auth/token";
import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const RouteGuard = () => {
  // prevent unnecessary re-renders
  if (useMemo(() => isTokenValid(), [])) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};
