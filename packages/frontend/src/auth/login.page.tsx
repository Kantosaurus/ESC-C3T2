import { Button } from "@/components/ui/button";
import { Navigate } from "react-router";
import { getSingpassAuthUrl } from "./singpass-auth-url";
import { getToken } from "./token";

export default function LoginPage() {
  if (getToken()) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row w-screen h-screen">
        <div className="flex-grow bg-blue-100"></div>
        <div className="bg-white p-8 rounded-lg flex-shrink h-fit md:min-w-[400px] md:h-full flex flex-col justify-center items-start">
          <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue.</p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              className="w-full"
              onClick={() =>
                getSingpassAuthUrl()
                  .then((res) => {
                    window.location.href = res.data.url;
                  })
                  .catch((err) => {
                    console.error("Failed to get Singpass auth URL:", err);
                  })
              }>
              Login with Singpass
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
