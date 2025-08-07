import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "motion/react";
import type { HTMLAttributes } from "react";

// get props of motion.div
export type CardProps = HTMLAttributes<HTMLDivElement> &
  MotionProps & {
    delay?: number;
    horizontal?: boolean; // Optional prop to control horizontal animation
  };

export default function Card(props: CardProps) {
  const { className, delay = 0, ...rest } = props;

  const key = props.horizontal ? "x" : "y";

  return (
    <motion.div
      initial={{ opacity: 0, [key]: 20 }}
      animate={{ opacity: 1, [key]: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        `bg-white dark:bg-gray-800 rounded-xl border p-6 soft-shadow`,
        rest.onClick &&
          "hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]",
        className
      )}
      {...rest}>
      {props.children}
    </motion.div>
  );
}
