import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const calendarCellVariants = cva("border p-2 text-center select-none", {
  variants: {
    variant: {
      default: "bg-white text-black",
      empty: "bg-gray-200 text-gray-300",
      header: "bg-gray-100 font-semibold cursor-default",
      today: "bg-blue-500 text-white font-bold",
    },
    interactive: {
      true: "cursor-pointer hover:bg-blue-100",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    interactive: false,
  },
});

export interface CalendarCellProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof calendarCellVariants> {
  asChild?: boolean;
}

const CalendarCell = React.forwardRef<HTMLDivElement, CalendarCellProps>(
  ({ className, variant, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(
          calendarCellVariants({ variant, interactive, className })
        )}
        {...props}
      />
    );
  }
);

CalendarCell.displayName = "CalendarCell";

export { CalendarCell };
