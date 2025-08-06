import { AppointmentForm, type AppointmentFormType } from "./appointment.form";
import { useGetAppointment } from "./use-appointment";
import type { Elder, Appointment } from "@carely/core";

export default function UpdateAppointmentForm({
  elder,
  appt,
  onSubmit,
}: {
  elder: Elder;
  appt: Appointment;
  onSubmit: (values: AppointmentFormType) => Promise<void>;
}) {
  const { appointment } = useGetAppointment(elder.id, appt.appt_id!);

  if (!appointment) {
    return <div>Error loading appointment</div>;
  }

  const defaultValues = {
    startDateTime: appointment.startDateTime,
    endDateTime: appointment.endDateTime,
    details: appointment.details || "",
    loc: appointment.loc || "",
    name: appointment.name,
    elder_id: appointment.elder_id,
    appt_id: appointment.appt_id,
  };

  return (
    <div className="bg-white rounded-lg">
      <AppointmentForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        elder_id={elder.id}
        selectedDate={new Date(appointment.startDateTime)}
        elder_name={elder.name}
      />
    </div>
  );
}
