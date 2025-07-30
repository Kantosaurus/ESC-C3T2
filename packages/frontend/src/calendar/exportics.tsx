import { generateIcsCalendar, type IcsEvent, type IcsCalendar } from "ts-ics";
import { useGetAppointments } from "./use-appointment";
import { toast } from "sonner";

export default function useCreateIcsFile(elder_id: number | null) {
  const { appointments, refetch } = useGetAppointments(elder_id);

  const triggerDownload = async () => {
    await refetch();
    if (!appointments || appointments.length === 0) {
      toast.error("No appointments to export");
      return;
    }

    const events: IcsEvent[] = appointments.map((appointment) => ({
      start: { date: new Date(appointment.startDateTime) },
      end: { date: new Date(appointment.endDateTime) },
      stamp: { date: new Date() },
      summary: appointment.name,
      uid: appointment.appt_id?.toString() || "",
      description: appointment.details || "",
      location: appointment.loc || "",
    }));

    const calendar: IcsCalendar = {
      prodId: "carely Appointments",
      version: "2.0",
      events: events,
    };

    const icsCalendar = generateIcsCalendar(calendar);
    const blob = new Blob([icsCalendar], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "carelyAppointments.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendar successfully exported");
  };
  return { triggerDownload };
}
