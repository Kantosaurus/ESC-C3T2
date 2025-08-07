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
        className="text-sm font-semibold text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 flex items-center gap-2 bg-transparent hover:bg-slate-100 border-0"
        onClick={() => setShowCalendar((prev) => !prev)}
      >
        {selected.toLocaleString("default", { month: "long", year: "numeric" })}
      </Button>

      {showCalendar && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 animate-in fade-in-0 zoom-in-95 duration-200"
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
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
