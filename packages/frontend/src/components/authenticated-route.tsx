import { Navigate, Outlet } from "react-router-dom";

export const RouteGuard = () => {
  const token = localStorage.getItem("carely-token");
  if (token) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};
