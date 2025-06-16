import { Button } from "@/components/ui/button";
import { SignedIn, useClerk } from "@clerk/clerk-react";
import { Navigate } from "react-router";

export default function LoginPage() {
  const { openSignIn } = useClerk();
  return (
    <>
      <SignedIn>
        <Navigate to={"/"} /> {/* Redirect to home if already signed in */}
      </SignedIn>

      <div className="flex flex-col md:flex-row w-screen h-screen">
        <div className="flex-grow bg-blue-100"></div>
        <div className="bg-white p-8 rounded-lg flex-shrink h-fit md:min-w-[400px] md:h-full flex flex-col justify-center items-start">
          <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue.</p>
          {/* SignInButton will be provided by Clerk */}
          <Button className="w-full" onClick={() => openSignIn()}>
            Login with Clerk
          </Button>
        </div>
      </div>
    </>
  );
}
