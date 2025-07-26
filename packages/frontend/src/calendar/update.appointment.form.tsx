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
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Update {appointment.name}
        </h2>
        <p className="text-gray-600">
          Make changes to the appointment information below.
        </p>
      </div>
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
