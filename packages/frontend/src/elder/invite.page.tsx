import { useCaregiver } from "@/caregiver/use-caregiver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http";
import { elderSchema, getInviteLinkResponseDtoSchema } from "@carely/core";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useElderDetails } from "./use-elder-details";

const useInviteLink = (elderId: number) => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    http()
      .get<{ inviteLink: string }>("/api/elder/invite", {
        params: {
          elderId: elderId.toString(),
        },
        signal: controller.signal,
      })
      .then((res) => getInviteLinkResponseDtoSchema.parse(res.data))
      .then((dto) => {
        setInviteLink(dto.inviteLink);
      })
      .catch((error) => {
        if (error.name === "CanceledError") {
          return; // Request was aborted, do nothing
        }
        toast.error("Error fetching invite link:", error);
        setError("Failed to fetch invite link. Please try again later.");
        console.error("Error fetching invite link:", error);
      });

    return () => {
      controller.abort();
    };
  }, [elderId]);

  return {
    inviteLink,
    error,
    isLoading: inviteLink === null && error === null,
  };
};

export function InvitePage() {
  const { id: _id } = useParams<{ id: string }>();
  const elderId = elderSchema.shape.id.parse(_id);

  const { inviteLink, isLoading } = useInviteLink(elderId);

  const elderName = useMemo(() => {
    if (!inviteLink) return null;
    const url = new URL(inviteLink);
    return url.searchParams.get("elderName");
  }, [inviteLink]);

  return (
    <section className="w-screen h-screen flex flex-col items-center justify-center gap-4 p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">
          Invite Caregivers to Help with {elderName}
        </h1>
        <p className="text-gray-600">
          Share this link with other caregivers you want to invite to care for
          this elder.
        </p>
        {isLoading && <p className="text-gray-500">Loading invite link...</p>}
        {!isLoading && inviteLink && (
          <div className="flex flex-row">
            <Input
              value={inviteLink}
              readOnly
              className="max-w-sm rounded-r-none"
            />
            <Button
              className="rounded-l-none"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Invite link copied to clipboard!");
              }}>
              Copy
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

const acceptInvite = (token: string) =>
  http().post("/api/elder/invite", { token });

export function AcceptInvitePage() {
  const navigate = useNavigate();
  const { caregiverDetails } = useCaregiver({
    onNotFound: () => {
      // if caregiver profile has not been created, redirect to create caregiver page,
      // and then redirect back to this page after creation
      const searchParams = new URLSearchParams();
      searchParams.set("after", window.location.href);
      navigate("/caregiver/new?" + searchParams.toString());
    },
  });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const elderId = useMemo(() => {
    if (!token) return null;
    const payload = atob(atob(decodeURIComponent(token)).split(".")[1]);
    const sub = JSON.parse(payload).sub;
    if (!sub || !sub.startsWith("invite-")) return null;
    return parseInt(sub.split("-")[1], 10);
  }, [token]);

  const { elderDetails } = useElderDetails(elderId);

  const isAlreadyCaregiver = !!elderDetails;

  if (!token) {
    return <section>Error: No token provided in the URL.</section>;
  }

  if (!caregiverDetails) {
    return <section>Loading...</section>;
  }

  if (isAlreadyCaregiver) {
    return (
      <section
        className="w-screen h-screen flex flex-col items-center justify-center gap-
4 p-8">
        <h2 className="text-2xl font-bold mb-4">
          You are already a caregiver for {elderDetails.name}.
        </h2>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </section>
    );
  }

  return (
    <section className="w-screen h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-bold">
        🎉 Welcome to Carely, {caregiverDetails?.name}! 🎉
      </h2>
      <h1 className="text-4xl font-bold">Accept Invite</h1>
      <Button
        disabled={isAlreadyCaregiver}
        onClick={() => {
          acceptInvite(token).then(
            () => {
              toast.success("Invite accepted successfully!");
              navigate("/dashboard");
            },
            () => {
              toast.error("Failed to accept invite. Please try again.");
            }
          );
        }}>
        Accept invite to be a caregiver for{" "}
        {searchParams.get("elderName") || "an elder"}
      </Button>
    </section>
  );
}
