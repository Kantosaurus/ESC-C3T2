import { SignedOut, SignedIn } from "@clerk/clerk-react";
import LandingPage from "./landing/landing.page";
import { Navigate } from "react-router";

function App() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Navigate to="/dashboard" />
      </SignedIn>
    </>
  );
}

export default App;
