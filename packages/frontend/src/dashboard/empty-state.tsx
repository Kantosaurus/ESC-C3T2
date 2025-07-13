import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  delay = 0,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="text-center py-8 flex flex-col items-center justify-center">
      <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
};
