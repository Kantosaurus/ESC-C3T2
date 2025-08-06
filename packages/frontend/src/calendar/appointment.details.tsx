import { Button } from "@/components/ui/button";
import {
  useGetAppointment,
  useGetDeclinedAppointments,
} from "./use-appointment";
import { Label } from "@/components/ui/label";
import type { Elder } from "@carely/core";
import {
  useAcceptAppointment,
  useGetCaregiver,
  useDeclineAppointment,
} from "./use-appointment";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { useCaregiver } from "@/caregiver/use-caregiver";
import { Undo } from "lucide-react";

const extractTimeFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function AppointmentDetailsPage({
  elder,
  appt_id,
}: {
  elder: Elder;
  appt_id: number;
}) {
  const { appointment, isLoading, error, refetchAppointment } =
    useGetAppointment(elder.id, appt_id);

  const caregiverId = appointment?.accepted;
  const { caregiver: acceptcaregiver } = useGetCaregiver(
    caregiverId ?? undefined
  );

  const { caregiver: createcaregiver } = useGetCaregiver(
    appointment?.created_by
  );

  const { caregiverDetails } = useCaregiver();

  const { declined } = useGetDeclinedAppointments(elder.id ?? null);

  const acceptAppointment = useAcceptAppointment();

  const handleAcceptAppointment = async (values: {
    elder_id: number;
    appt_id: number | undefined;
    undo: boolean;
  }) => {
    try {
      await acceptAppointment(values);
      await refetchAppointment();
      if (values.undo) {
        toast.success("Undo Successful");
      } else {
        toast.success("Appointment Accepted");
      }
    } catch (error) {
      console.error("Error accepting appointment:", error);
      const axiosErr = error as AxiosError<{ error: string }>;
      const message = axiosErr.response?.data?.error ?? "Unexpected error";
      toast.error(message);
    }
  };

  const allDeclined = declined?.some((item) => item.appt_id === appt_id);

  const declineAppointment = useDeclineAppointment();
  const handleDeclineAppointment = async (values: {
    elder_id: number;
    appt_id: number | undefined;
    undo: boolean;
  }) => {
    try {
      await declineAppointment(values);
      await refetchAppointment();
      if (values.undo) {
        toast.success("Undo Successful");
      } else {
        toast.success("Appointment Declined");
      }
    } catch (error) {
      console.error("Error declining appointment:", error);
      const axiosErr = error as AxiosError<{ error: string }>;
      const message = axiosErr.response?.data?.error ?? "Unexpected error";
      toast.error(message);
    }
  };

  if (isLoading) {
    return <div>Loading appointment details</div>;
  }

  if (error) {
    return <div>Error loading appointment details</div>;
  }

  if (!appointment) {
    return <div>No appointment found</div>;
  }

  return (
    <div>
      <div className="-mt-3 p-4 border rounded bg-white shadow space-y-6 max-w-xl mx-auto">
        <div className="space-y-2">
          <Label className="text-gray-600">Elder</Label>
          <div className="p-2 border rounded bg-gray-50">{elder.name}</div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">Appointment Title</Label>
          <div className="p-2 border rounded bg-gray-50 truncate">
            {appointment.name || "Missing title"}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">Start Time</Label>
          <div className="p-2 border rounded bg-gray-50">
            {appointment.startDateTime
              ? extractTimeFromISO(appointment.startDateTime.toString())
              : "Missing start time"}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">End Time</Label>
          <div className="p-2 border rounded bg-gray-50">
            {appointment.endDateTime
              ? extractTimeFromISO(appointment.endDateTime.toString())
              : "Missing end time"}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">Details</Label>
          <div className="p-2 border rounded bg-gray-50 whitespace-pre-wrap break-words">
            {appointment.details || (
              <span className="text-gray-400">No details</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">Location</Label>
          <div className="p-2 border rounded bg-gray-50">
            {appointment.loc || (
              <span className="text-gray-400">No location specified</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-600">Created by</Label>
          <div className="p-2 border rounded bg-gray-50">
            <span>{createcaregiver?.name}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 border rounded bg-white shadow space-y-6 max-w-xl mx-auto">
        <div>
          {caregiverDetails && appointment.accepted ? (
            appointment.accepted === caregiverDetails.id ? (
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-lg">Accepted by you</Label>
                <Button
                  data-testid="undo-accept-button"
                  variant="outline"
                  onClick={() => {
                    handleAcceptAppointment({
                      elder_id: appointment.elder_id,
                      appt_id: appointment.appt_id,
                      undo: true,
                    });
                  }}
                >
                  <Undo /> Undo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-gray-600">
                  Already accepted by another caregiver
                </Label>
                <div className="p-2 border rounded bg-gray-100 text-gray-500 italic">
                  {acceptcaregiver
                    ? acceptcaregiver.name
                    : "Name cannot be found"}
                </div>
              </div>
            )
          ) : caregiverDetails &&
            appointment.declined?.includes(caregiverDetails.id) ? (
            <div>
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-lg">Declined by you</Label>
                <Button
                  data-testid="undo-decline-button"
                  variant="outline"
                  onClick={() => {
                    handleDeclineAppointment({
                      elder_id: appointment.elder_id,
                      appt_id: appointment.appt_id,
                      undo: true,
                    });
                  }}
                >
                  <Undo /> Undo
                </Button>
              </div>
              {allDeclined && (
                <div className="mt-1 text-xs text-red-500 italic">
                  All caregivers have declined this appointment, kindly contact
                  external caregivers for assistance
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-lg">
                Accept/Decline Appointment?
              </Label>
              <div className="flex gap-2">
                <Button
                  data-testid="accept-appointment-button"
                  variant="outline"
                  onClick={() => {
                    handleAcceptAppointment({
                      elder_id: appointment.elder_id,
                      appt_id: appointment.appt_id,
                      undo: false,
                    });
                  }}
                >
                  Accept
                </Button>
                <Button
                  data-testid="decline-appointment-button"
                  variant="outline"
                  onClick={() => {
                    handleDeclineAppointment({
                      elder_id: appointment.elder_id,
                      appt_id: appointment.appt_id,
                      undo: false,
                    });
                  }}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
