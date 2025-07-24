import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export function MiniCalendar({
  selected,
  onSelect,
}: {
  selected: Date;
  onSelect: (date: Date) => void;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    }

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  return (
    <div className="relative inline-block text-center">
      <Button
        ref={buttonRef}
        variant="ghost"
        className="text-sm font-medium text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition flex items-center gap-1"
        onClick={() => setShowCalendar((prev) => !prev)}
      >
        {selected.toLocaleString("default", { month: "long", year: "numeric" })}
      </Button>

      {showCalendar && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 bg-white border rounded shadow p-2"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onSelect(date);
                setShowCalendar(false);
              }
            }}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2100}
          />
        </div>
      )}
    </div>
  );
}
