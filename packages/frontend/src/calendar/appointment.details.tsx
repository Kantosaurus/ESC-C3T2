import { Button } from "@/components/ui/button";
import { useGetAppointment } from "./use-appointment";
import { Label } from "@/components/ui/label";
import type { Elder } from "@carely/core";
import { useAcceptAppointment, useGetCaregiver } from "./use-appointment";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { useCaregiver } from "@/caregiver/use-caregiver";
import { Undo } from "lucide-react";
import {
  SafeAppointmentDetails,
  SafeLocation,
  SafeAppointmentName,
  SafeName,
} from "@/lib/xss-protection";

const extractTimeFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  let ampm = "AM";
  let hours = date.getHours();
  if (hours > 11) {
    ampm = "PM";
    if (hours > 12) {
      hours -= 12;
    }
  }
  return `${hours.toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")} ${ampm}`;
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
  const { caregiver } = useGetCaregiver(caregiverId ?? undefined);

  const { caregiverDetails } = useCaregiver();

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
      <div className="mt-4 p-4 border rounded bg-white shadow space-y-6 max-w-xl mx-auto">
        <div className="space-y-2">
          <Label className="text-gray-600">Elder</Label>
          <div className="p-2 border rounded bg-gray-50">
            <SafeName name={elder.name} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">Appointment Title</Label>
          <div className="p-2 border rounded bg-gray-50">
            <SafeAppointmentName name={appointment.name} />
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
          <div className="p-2 border rounded bg-gray-50 whitespace-pre-wrap">
            <SafeAppointmentDetails details={appointment.details} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-600">Location</Label>
          <div className="p-2 border rounded bg-gray-50">
            <SafeLocation location={appointment.loc} />
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 border rounded bg-white shadow space-y-6 max-w-xl mx-auto">
        <div>
          {appointment.accepted ? (
            caregiverDetails && appointment.accepted === caregiverDetails.id ? (
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-lg">Accepted by you</Label>
                <Button
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
                  <SafeName
                    name={caregiver ? caregiver.name : "Name cannot be found"}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-lg">
                Accept Appointment?
              </Label>
              <Button
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
