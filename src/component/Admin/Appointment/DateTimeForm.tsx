// src/components/Admin/Appointment/DateTimeForm.tsx
import { ChevronDown, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

export function DateInput({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
}: DateProps) {
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
    if (
      cleaned.replace(/\//g, "").length >= 4 &&
      cleaned.split("/").length === 2
    ) {
      const parts = cleaned.split("/");
      formatted =
        parts[0] + "/" + parts[1].slice(0, 2) + "/" + parts[1].slice(2);
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

const generateTimeSlots = (step = 15) => {
  const slots = [];
  const startHour = 8; // Bắt đầu 7h sáng
  const endHour = 17; // Kết thúc 20h tối

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let min = 0; min < 60; min += step) {
      const h = hour.toString().padStart(2, "0");
      const m = min.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots(30);

export function TimeInput({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
}: TimeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const handleSelect = (time: string) => {
    onChange?.(time);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Input giả lập - hiển thị đẹp hơn input gốc */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "mt-1 flex h-12 w-full cursor-pointer items-center justify-between rounded-[var(--rounded)] border px-4 text-[16px] shadow-sm transition-all bg-white",
          disabled && "bg-gray-100 cursor-not-allowed text-gray-400",
          invalid
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-300"
            : "border-slate-200 focus-within:ring-2 focus-within:ring-slate-200",
          isOpen && "ring-2 ring-slate-200 border-slate-200"
        )}
      >
        <div className="flex items-center gap-3 w-full">
          <Clock
            className={cn("w-5 h-5", value ? "text-sky-500" : "text-gray-400")}
          />
          <span className={cn("flex-1", !value && "text-gray-400")}>
            {value || "Chọn giờ khám"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
          {TIME_SLOTS.map((time) => (
            <div
              key={time}
              onClick={() => handleSelect(time)}
              className={cn(
                "cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-sky-50 hover:text-sky-600",
                value === time && "bg-sky-100 text-sky-700 font-medium"
              )}
            >
              {time}
            </div>
          ))}
          {TIME_SLOTS.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Không có giờ khả dụng
            </div>
          )}
        </div>
      )}
    </div>
  );
}
