import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const calendarCellVariants = cva(
  "w-full h-full border border-gray-200 bg-white p-2 text-left select-none flex flex-col justify-start items-start transition-all hover:bg-gray-50",
  {
    variants: {
      variant: {
        default: "",
        empty:
          "bg-gray-100 text-gray-300 border-gray-100 cursor-default hover:bg-gray-100",
        today:
          "border-blue-400 ring-2 ring-blue-200 font-semibold text-blue-700",
      },
      hasEvent: {
        true: "",
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
  eventLabel?: string | string[];
}

const CalendarCell = React.forwardRef<HTMLDivElement, CalendarCellProps>(
  (
    { className, variant, hasEvent, asChild, children, eventLabel, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(calendarCellVariants({ variant, hasEvent, className }))}
        {...props}
      >
        <div className="text-sm font-medium">{children}</div>
        {Array.isArray(eventLabel) &&
          eventLabel.map((label, i) => (
            <div
              key={i}
              className="mt-1 w-full text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
            >
              {label}
            </div>
          ))}
      </Comp>
    );
  }
);

export { CalendarCell };
