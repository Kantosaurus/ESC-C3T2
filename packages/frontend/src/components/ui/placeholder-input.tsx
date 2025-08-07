"use client";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PlaceholderInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function PlaceholderInput({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  type = "text",
  onFocus,
  onBlur,
}: PlaceholderInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          (isFocused || hasValue) && "border-blue-500"
        )}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          "text-gray-500",
          (isFocused || hasValue) &&
            "text-blue-500 text-sm -top-2 bg-white px-2",
          !isFocused && !hasValue && "top-3 text-base"
        )}
      >
        {placeholder}
      </label>
    </div>
  );
}
