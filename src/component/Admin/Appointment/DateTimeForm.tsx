// src/components/Admin/Appointment/DateTimeForm.tsx

type DateProps = {
  value?: string; // "YYYY-MM-DD"
  onChange?: (v: string) => void;
  disabled?: boolean;
};
type TimeProps = {
  value?: string; // "HH:mm"
  onChange?: (v: string) => void;
  disabled?: boolean;
};

export function DateInput({ value, onChange, disabled }: DateProps) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="mt-1 block w-full h-12 rounded-[var(--rounded)] border border-slate-200 px-4 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
    />
  );
}

export function TimeInput({ value, onChange, disabled }: TimeProps) {
  return (
    <input
      type="time"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      step={60} // phút
      className="mt-1 block w-full h-12 rounded-[var(--rounded)] border border-slate-200 px-4 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
    />
  );
}
