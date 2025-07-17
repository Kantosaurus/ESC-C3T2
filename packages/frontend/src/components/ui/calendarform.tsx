import { useState, useEffect } from "react";

interface CalendarFormProps {
  onSave: (appt: {
    title: string;
    time: string;
    date: string;
    details?: string;
  }) => void;
  onCancel: () => void;
  initialDate?: Date | null;
}

export default function CalendarForm({
  onSave,
  onCancel,
  initialDate = null,
}: CalendarFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    time: "",
    date: "",
    details: "",
  });

  useEffect(() => {
    if (initialDate) {
      const yyyyMmDd = initialDate.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, date: yyyyMmDd }));
    }
  }, [initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, time, date, details } = formData;
    onSave({ title, time, date, details });
    setFormData({ title: "", time: "", date: "", details: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-4 border rounded bg-white shadow space-y-2"
    >
      <h3 className="font-semibold">New Appointment</h3>
      <input
        type="text"
        placeholder="Title"
        className="w-full border p-2"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <input
        type="time"
        className="w-full border p-2"
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
      />
      <input
        type="date"
        className="w-full border p-2"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />
      <textarea
        placeholder="Details (optional)"
        className="w-full border p-2"
        value={formData.details}
        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          type="button"
          className="bg-gray-300 px-4 py-2 rounded"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
