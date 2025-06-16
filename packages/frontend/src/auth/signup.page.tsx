import { SignedIn } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <>
      <SignedIn>
        <Navigate to={"/"} /> {/* Redirect to home if already signed in */}
      </SignedIn>
      <div className="flex flex-col md:flex-row w-screen h-screen">
        <div className="flex-grow bg-blue-100"></div>
        <div className="bg-white p-8 rounded-lg flex-shrink h-fit md:min-w-[400px] md:h-full flex flex-col justify-center items-start">
          <h1 className="text-2xl font-bold mb-4">Create your account</h1>
          <p className="text-gray-600 mb-6">
            Sign up to get started with Carely.
          </p>
          <div className="w-full">
            <SignUp path="/sign-up" routing="path" />
          </div>
        </div>
      </div>
    </>
  );
}
