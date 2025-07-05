import type { ReactNode } from "react";
import Card from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  delay?: number;
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
};

export const DashboardCard = ({
  title,
  value,
  icon,
  color = "blue",
  onClick,
}: DashboardCardProps) => {
  return (
    <Card onClick={onClick}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={colorClasses[color]}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};
