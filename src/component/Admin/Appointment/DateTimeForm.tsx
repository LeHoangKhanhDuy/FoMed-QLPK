import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Input } from "../../ui/input";

// util: format ngày yyyy-mm-dd
function formatDateNow() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
// util: format giờ hh:mm
function formatTimeNow() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function DateInput() {
  return (
    <Input
      type="text" 
      value={formatDateNow()} 
      disabled 
      rightIcon={<CalendarIcon className="h-5 w-5" />}
      className="!bg-slate-50 cursor-not-allowed text-slate-700"
    />
  );
}

export function TimeInput() {
  return (
    <Input
      type="text"
      value={formatTimeNow()}
      disabled
      rightIcon={<Clock className="h-5 w-5" />}
      className="!bg-slate-50 cursor-not-allowed text-slate-700"
    />
  );
}
