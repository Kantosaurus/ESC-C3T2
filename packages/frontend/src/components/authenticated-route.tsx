import { isTokenValid } from "@/auth/token";
import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const RouteGuard = () => {
  // prevent unnecessary re-renders
  if (useMemo(() => isTokenValid(), [])) {
    return <Outlet />;
  } else {
    // get the current full url
    const currentUrl = window.location.href;
    //encode the current url
    const encodedUrl = encodeURIComponent(currentUrl);
    // redirect to login with the current url as a query parameter
    return <Navigate to={`/login?after=${encodedUrl}`} />;
  }
};
