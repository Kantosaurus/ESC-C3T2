import { useAfter } from "@/lib/use-after";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function RedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const after = useAfter();

  useEffect(() => {
    if (!searchParams || !after) {
      return;
    }
    const carelyToken = searchParams.get("token");
    if (!carelyToken) {
      console.error("No carely token found in URL");
      navigate("/login");
      return;
    }
    localStorage.setItem("carely-token", carelyToken);
    after();
  }, [after, navigate, searchParams]);

  return <>redirecting...</>;
}
