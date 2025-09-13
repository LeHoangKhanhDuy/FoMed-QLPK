import { CalendarCheck, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export default function DateTimeForm() {
  const [form, setForm] = useState({
    date: "",
    time: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const now = new Date();

    // Lấy ngày theo format YYYY-MM-DD
    const today = now.toISOString().split("T")[0];

    // Lấy giờ theo format HH:mm
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;

    setForm({ date: today, time: currentTime });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-2">
      {/* Date */}
      <div className="relative space-y-2">
        <label className="text-sm text-slate-600">Ngày khám</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          readOnly
          aria-readonly
          className="mt-2 block w-full min-h-[44px] rounded-lg border px-3 py-2 text-base outline-none bg-slate-50 text-slate-700 cursor-pointer"
        />
        <CalendarCheck className="w-5 h-5 text-slate-400 absolute right-3 top-11" />
      </div>

      {/* Time */}
      <div className="relative space-y-2">
        <label className="text-sm text-slate-600">Giờ khám</label>
        <input
          type="time"
          value={form.time}
          onChange={(e) => update("time", e.target.value)}
          readOnly
          aria-readonly
          className="mt-2 block w-full min-h-[44px] rounded-lg border px-3 py-2 text-base outline-none bg-slate-50 text-slate-700 cursor-pointer"
        />
        <Timer className="w-5 h-5 text-slate-400 absolute right-3 top-11" />
      </div>
    </div>
  );
}
