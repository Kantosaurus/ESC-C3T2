import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const calendarCellVariants = cva(
  "w-full h-full border-r border-b border-slate-300 bg-white p-3 text-left select-none flex flex-col justify-start items-start transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-400 cursor-pointer group",
  {
    variants: {
      variant: {
        default: "hover:bg-gradient-to-br hover:from-slate-50 hover:to-white",
        empty:
          "bg-slate-50 text-slate-300 border-slate-200 cursor-default hover:bg-slate-50 hover:shadow-none hover:scale-100 hover:border-slate-200",
        today:
          "font-semibold text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-white hover:shadow-red-200/30 border-slate-400 hover:border-slate-500",
      },
      hasEvent: {
        true: "bg-gradient-to-br from-white to-slate-50/50 hover:from-slate-50 hover:to-white border-slate-400",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hasEvent: false,
    },
  }
);

export interface CalendarCellProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof calendarCellVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
  eventlabel?: string[];
}

const CalendarCell = React.forwardRef<HTMLDivElement, CalendarCellProps>(
  (
    { className, variant, hasEvent, asChild, children, eventlabel, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    //prevent overflow
    if (eventlabel && eventlabel?.length > 4) {
      const extraEvents = eventlabel.length - 3;
      eventlabel.length = 3;
      eventlabel.push(`+${extraEvents} more`);
    }
    return (
      <Comp
        ref={ref}
        className={cn(calendarCellVariants({ variant, hasEvent, className }))}
        {...props}
      >
        <div
          className={cn(
            "text-sm font-medium text-slate-900 group-hover:text-slate-700 transition-all duration-300 ease-out",
            variant === "today" && "relative"
          )}
        >
          {variant === "today" ? (
            <span className="relative">
              <span className="absolute inset-0 w-8 h-8 bg-red-100 rounded-full -left-1 -top-1 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-red-200"></span>
              <span className="relative z-10 flex items-center justify-center w-6 h-6">
                {children}
              </span>
            </span>
          ) : (
            children
          )}
        </div>
        {Array.isArray(eventlabel) &&
          eventlabel.map((label, i) => (
            <div
              key={i}
              className="mt-2 w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md truncate border border-blue-200/50 shadow-sm transition-all duration-300 ease-out group-hover:bg-blue-200 group-hover:text-blue-800 group-hover:shadow-md group-hover:scale-[1.02]"
            >
              {label}
            </div>
          ))}
        {hasEvent && !Array.isArray(eventlabel) && (
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-blue-500 rounded-full transition-all duration-300 ease-out group-hover:scale-125 group-hover:bg-blue-600 group-hover:shadow-sm"></div>
        )}
      </Comp>
    );
  }
);

export { CalendarCell };
