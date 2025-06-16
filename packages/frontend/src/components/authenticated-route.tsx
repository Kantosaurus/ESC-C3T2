import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router-dom";

export const RouteGuard = () => {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" />
      </SignedOut>
    </>
  );
};
