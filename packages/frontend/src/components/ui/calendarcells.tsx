import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const calendarCellVariants = cva("border p-2 text-center select-none", {
  variants: {
    variant: {
      default: "bg-white text-black cursor-pointer hover:bg-blue-100",
      empty: "bg-gray-200 text-gray-300",
      today: "font-bold text-blue-500",
    },
    hasEvent: {
      true: "bg-blue-100 border-blue-300",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    hasEvent: false,
  },
});

export interface CalendarCellProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof calendarCellVariants> {
  asChild?: boolean;
}

const CalendarCell = React.forwardRef<HTMLDivElement, CalendarCellProps>(
  ({ className, variant, hasEvent, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(calendarCellVariants({ variant, hasEvent, className }))}
        {...props}
      />
    );
  }
);

export { CalendarCell };
