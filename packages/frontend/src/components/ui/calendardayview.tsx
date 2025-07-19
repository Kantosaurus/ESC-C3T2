import type { Appointment } from "@carely/core";

export function DayView({
  appointments,
  onSelect,
}: {
  date: Date;
  appointments: Appointment[];
  onSelect?: (appt: Appointment) => void;
}) {
  const startHour = 6;
  const endHour = 22;
  const totalMinutes = (endHour - startHour) * 60;
  const pxPerMinute = 1.5;

  const getMinutesSinceStart = (dt: Date) =>
    dt.getHours() * 60 + dt.getMinutes() - startHour * 60;

  const getDuration = (start: Date, end: Date) =>
    (end.getTime() - start.getTime()) / 60000;

  return (
    <div
      className="relative bg-white rounded shadow p-4 w-full max-w-2xl border-l border-t overflow-hidden"
      style={{ height: `${totalMinutes * pxPerMinute}px` }}
    >
      {Array.from({ length: endHour - startHour + 1 }).map((_, i) => {
        const hour = startHour + i;
        return (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-200 text-xs text-gray-400 pl-2"
            style={{ top: `${i * 60 * pxPerMinute}px` }}
          >
            {new Date(0, 0, 0, hour).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        );
      })}

      {appointments.map((appt, i) => {
        const start = new Date(appt.startDateTime);
        const end = new Date(appt.endDateTime);
        const top = getMinutesSinceStart(start) * pxPerMinute;
        const height = getDuration(start, end) * pxPerMinute;

        return (
          <div
            key={i}
            className="absolute left-[80px] right-4 bg-blue-100 border-l-4 border-blue-500 text-sm p-2 rounded shadow-sm cursor-pointer"
            style={{ top: `${top}px`, height: `${height}px` }}
            onClick={() => onSelect?.(appt)}
          >
            <div className="text-blue-700 font-medium">{appt.name}</div>
            <div className="text-blue-800 font-semibold">
              {start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {end.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
