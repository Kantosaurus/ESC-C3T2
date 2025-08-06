import type { Appointment } from "@carely/core";

export function DayView({
  viewDateString,
  appointments,
  onSelect,
}: {
  viewDateString: string | undefined;
  date: Date;
  appointments: Appointment[];
  onSelect?: (appt: Appointment) => void;
}) {
  const startHour = 0;
  const endHour = 24;
  const totalMinutes = (endHour - startHour) * 60;
  const pxPerMinute = 1.5;

  const getMinutesSinceStart = (dt: Date) =>
    dt.getHours() * 60 + dt.getMinutes() - startHour * 60;

  const getDuration = (start: Date, end: Date) =>
    (end.getTime() - start.getTime()) / 60000;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {viewDateString}
        </h2>
        <div className="text-sm text-slate-500">
          {appointments.length} appointment
          {appointments.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Timeline */}
      <div
        className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-full max-w-2xl overflow-hidden"
        style={{ height: `${totalMinutes * pxPerMinute}px` }}
      >
        {/* Hour markers */}
        {Array.from({ length: endHour - startHour + 1 }).map((_, i) => {
          const hour = startHour + i;
          return (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-slate-100 text-xs text-slate-400 pl-2 flex items-center"
              style={{ top: `${i * 60 * pxPerMinute}px` }}
            >
              <span className="bg-white pr-2">
                {new Date(0, 0, 0, hour).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          );
        })}

        {/* Appointments */}
        {appointments.map((appt, i) => {
          const start = new Date(appt.startDateTime);
          const end = new Date(appt.endDateTime);
          const top = getMinutesSinceStart(start) * pxPerMinute;
          const height = getDuration(start, end) * pxPerMinute;
          const showTime = height >= 50;

          return (
            <div
              key={i}
              className="absolute left-[80px] right-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 text-sm p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:from-blue-100 hover:to-blue-200 group"
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => onSelect?.(appt)}
            >
              {showTime ? (
                <div>
                  <div className="text-blue-800 font-semibold -mt-1  group-hover:text-blue-900 truncate transition-colors">
                    {appt.name}
                  </div>
                  <div className="text-blue-700 text-xs mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
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
              ) : (
                <div className="text-blue-800 font-semibold -mt-2 flex items-center gap-2 group-hover:text-blue-900 truncate transition-colors">
                  {appt.name}{" "}
                  <div className="text-blue-700 text-xs flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
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
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {appointments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 text-slate-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-slate-500 text-sm font-medium">
                No appointments scheduled
              </div>
              <div className="text-slate-400 text-xs">
                Click "Add Appointment" to schedule one
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
