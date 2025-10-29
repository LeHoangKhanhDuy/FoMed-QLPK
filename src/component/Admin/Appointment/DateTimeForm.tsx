// src/components/Admin/Appointment/DateTimeForm.tsx
import { useState, useEffect } from "react";

const cn = (...args: (string | false | undefined)[]) =>
  args.filter(Boolean).join(" ");

type DateProps = {
  value?: string; // "YYYY-MM-DD"
  onChange?: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
};
type TimeProps = {
  value?: string; // "HH:mm"
  onChange?: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
};

// Helper to convert YYYY-MM-DD to DD/MM/YYYY
const formatDateToDisplay = (isoDate: string): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
const formatDateToISO = (displayDate: string): string => {
  if (!displayDate) return "";
  const cleaned = displayDate.replace(/[^\d]/g, "");
  if (cleaned.length === 8) {
    const day = cleaned.slice(0, 2);
    const month = cleaned.slice(2, 4);
    const year = cleaned.slice(4, 8);
    return `${year}-${month}-${day}`;
  }
  return "";
};

export function DateInput({ value, onChange, onBlur, disabled, invalid }: DateProps) {
  const [inputValue, setInputValue] = useState("");

  // Sync with external value prop
  useEffect(() => {
    if (value) {
      setInputValue(formatDateToDisplay(value));
    } else {
      setInputValue("");
    }
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow numbers and slashes
    const cleaned = input.replace(/[^\d/]/g, "");
    
    // Auto-format while typing
    let formatted = cleaned;
    if (cleaned.length >= 2 && !cleaned.includes("/")) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.replace(/\//g, "").length >= 4 && cleaned.split("/").length === 2) {
      const parts = cleaned.split("/");
      formatted = parts[0] + "/" + parts[1].slice(0, 2) + "/" + parts[1].slice(2);
    }
    
    // Update the local input state
    setInputValue(formatted);
    
    // Only call onChange if we have a complete date (DD/MM/YYYY)
    if (formatted.length === 10) {
      const isoDate = formatDateToISO(formatted);
      if (isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        onChange?.(isoDate);
      }
    } else if (formatted.length === 0) {
      onChange?.("");
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder="dd/mm/yyyy"
      maxLength={10}
      inputMode="numeric"
      className={cn(
        "mt-1 block w-full h-12 rounded-[var(--rounded)] border px-4 text-[16px] leading-6 shadow-xs outline-none focus:ring-2",
        invalid
          ? "border-red-400 focus:ring-red-300"
          : "border-slate-200 focus:ring-sky-500"
      )}
    />
  );
}

export function TimeInput({ value, onChange, onBlur, disabled, invalid }: TimeProps) {
  return (
    <input
      type="time"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      step={60} // phút
      className={cn(
        "mt-1 block w-full h-12 rounded-[var(--rounded)] border px-4 text-[16px] leading-6 shadow-xs outline-none focus:ring-2",
        invalid
          ? "border-red-400 focus:ring-red-300"
          : "border-slate-200 focus:ring-sky-500"
      )}
    />
  );
}
