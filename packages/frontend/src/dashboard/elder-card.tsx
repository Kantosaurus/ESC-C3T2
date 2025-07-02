import type { Elder } from "@carely/core";
import { User, Calendar, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";

interface ElderCardProps {
  elder: Elder;
  onClick?: () => void;
  delay?: number;
}

export const ElderCard = ({ elder, onClick, delay = 0 }: ElderCardProps) => {
  const getAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatAddress = (address: string) => {
    if (!address) return "No address provided";
    return address.length > 50 ? address.substring(0, 50) + "..." : address;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {elder.name}
            </h3>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full capitalize">
              {elder.gender}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{getAge(elder.date_of_birth)} years old</span>
            </div>

            <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="truncate">{formatAddress(elder.address)}</span>
            </div>

            {elder.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>{elder.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Care Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
