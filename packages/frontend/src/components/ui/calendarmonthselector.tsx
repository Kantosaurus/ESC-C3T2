import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export function MonthSelector({
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
      <button
        ref={buttonRef}
        onClick={() => setShowCalendar((prev) => !prev)}
        className="text-sm font-medium text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition flex items-center gap-1"
      >
        {selected.toLocaleString("default", { month: "long", year: "numeric" })}
      </button>

      {showCalendar &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-[9999] mt-2 bg-white border rounded shadow p-2"
            style={{
              position: "absolute",
              top: buttonRef.current?.getBoundingClientRect().bottom ?? 0,
              left: buttonRef.current?.getBoundingClientRect().left ?? 0,
            }}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) {
                  onSelect(date);
                  setShowCalendar(false);
                }
              }}
              defaultMonth={selected}
              captionLayout="dropdown"
              hidden={{ before: new Date(2000, 0), after: new Date(2100, 11) }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
