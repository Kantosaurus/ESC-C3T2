import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function RedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const carelyToken = searchParams.get("token");
    if (!carelyToken) {
      console.error("No carely token found in URL");
      navigate("/login");
      return;
    }
    localStorage.setItem("carely-token", carelyToken);
    navigate("/dashboard");
  }, [navigate, searchParams]);

  return <>redirecting...</>;
}
