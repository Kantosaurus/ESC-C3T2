import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 p-8">
      <h3 className="text-4xl font-medium mb-4">🤸 Carely</h3>
      <Link to="/login" className="max-w-xl w-full h-72">
        <div className="max-w-xl w-full h-72 rounded-t-4xl border bg-white flex items-center justify-center gradient-mask hover:-translate-y-1 hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-xl cursor-pointer">
          Product snapshot here
        </div>
      </Link>
      <h1 className="text-6xl font-bold mt-4 mb-4">
        Focus on caregiving, we'll do the rest
      </h1>
      <p className="text-muted-foreground max-w-2xl text-center mb-8">
        Carely is a platform designed to help caregivers reduce cognitive load
        and administrative burdens, allowing them to focus on what truly
        matters: providing care.
      </p>
      <Link to="/login">
        <Button size="lg">Try the app</Button>
      </Link>
    </div>
  );
}
