"use client";
import { useState, useRef } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VanishInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  onClear?: () => void;
  showClearButton?: boolean;
}

export function VanishInput({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  onClear,
  showClearButton = true,
}: VanishInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 pr-20 bg-white border border-gray-300 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-gray-400"
          )}
        />

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Clear Button */}
          {showClearButton && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={toggleVisibility}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
