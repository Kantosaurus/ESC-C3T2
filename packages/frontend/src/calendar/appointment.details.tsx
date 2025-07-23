import { useGetAppointment } from "./use-appointment";
import { Label } from "@/components/ui/label";
import type { Elder } from "@carely/core";

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
  const { appointment, isLoading, error } = useGetAppointment(
    elder.id,
    appt_id
  );

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
    <div className="mt-4 p-4 border rounded bg-white shadow space-y-6 max-w-xl mx-auto">
      <div className="space-y-2">
        <Label className="text-gray-600">Elder</Label>
        <div className="p-2 border rounded bg-gray-50">{elder.name}</div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-600">Appointment Title</Label>
        <div className="p-2 border rounded bg-gray-50">
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
        <div className="p-2 border rounded bg-gray-50 whitespace-pre-wrap">
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
    </div>
  );
}
