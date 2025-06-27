import { Button } from "@/components/ui/button";
import { Navigate, useSearchParams } from "react-router";
import { getSingpassAuthUrl } from "./singpass-auth-url";
import { getToken } from "./token";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const after = searchParams.get("after") ?? undefined;

  if (getToken()) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row w-screen h-screen">
        <div className="flex-grow bg-blue-100">
          <img
            src="splash.jpg"
            alt="Splash"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-white p-8 rounded-lg flex-shrink h-fit md:min-w-[400px] md:h-full flex flex-col justify-center items-start">
          <h1 className="text-2xl mb-4">🤸 Carely</h1>
          <h2 className="text-4xl font-bold mb-2">Login</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue.</p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              className="w-full"
              variant="singpass"
              onClick={() =>
                getSingpassAuthUrl(after)
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
          <p className="text-gray-500 text-xs mt-6 max-w-lg">
            Carely is currently only available to Singaporean/PR caregivers who
            have access to the Singpass app. If you are a caregiver in Singapore
            and would like to use Carely, please contact us at{" "}
            <a href="mailto:support@carely.com" className="text-blue-500">
              support@carely.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
