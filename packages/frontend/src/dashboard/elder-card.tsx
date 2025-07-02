import type { Elder } from "@carely/core";
import { User } from "lucide-react";
import { motion } from "motion/react";

interface ElderCardProps {
  elder: Elder;
  onClick?: () => void;
  delay?: number;
}

export const ElderCard = ({ elder, onClick, delay = 0 }: ElderCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`border border-gray-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {elder.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {elder.address}
          </p>
          {elder.phone && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {elder.phone}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
