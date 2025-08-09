import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassmorphicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function GlassmorphicModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: GlassmorphicModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        background: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-md transform rounded-2xl p-6 transition-all duration-300 ease-out",
          "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl",
          "hover:bg-white/90",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
