import { useCaregiver } from "@/caregiver/use-caregiver";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http";
import { elderSchema } from "@carely/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

const useInviteLink = (elderId: number) => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    http()
      .get<{ inviteLink: string }>("/api/elder/invite", {
        params: {
          elderId: elderId.toString(),
        },
      })
      .then((res) => {
        setInviteLink(res.data.inviteLink);
      })
      .catch((error) => {
        console.error("Error fetching invite link:", error);
        setInviteLink(null);
      });
  }, [elderId]);

  return { inviteLink };
};

export function InvitePage() {
  const { id: _id } = useParams<{ id: string }>();
  const elderId = elderSchema.shape.id.parse(_id);

  const { inviteLink } = useInviteLink(elderId);

  if (!inviteLink) {
    return (
      <section>Error fetching invite link. Please try again later.</section>
    );
  }

  return (
    <section>
      {inviteLink}
      <Button
        onClick={() => {
          navigator.clipboard.writeText(inviteLink);
          toast.success("Invite link copied to clipboard!");
        }}>
        Copy Invite Link
      </Button>
    </section>
  );
}

const acceptInvite = (token: string) =>
  http()
    .post("/api/elder/invite", { token })
    .catch(() => {
      toast.error("Failed to accept invite. Please try again.");
    });

export function AcceptInvitePage() {
  const navigate = useNavigate();
  const caregiver = useCaregiver({
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

  if (!token) {
    return <section>Error: No token provided in the URL.</section>;
  }

  return (
    <section>
      <h2>Welcome to Carely, {caregiver.caregiverDetails?.name}!</h2>
      <h1>Accept Invite</h1>
      <p>
        You have been invited to be a caregiver for{" "}
        {searchParams.get("elderName") || "an elder"}.
      </p>
      <Button
        onClick={() => {
          acceptInvite(token).then(() => {
            toast.success("Invite accepted successfully!");
            navigate("/dashboard");
          });
        }}>
        Accept invite to be a caregiver of{" "}
        {searchParams.get("elderName") || "an elder"}
      </Button>
    </section>
  );
}
