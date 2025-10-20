// src/utils/format.ts

/** Format tiền Việt Nam (VD: 150000 -> "150.000 ₫") */
export function formatVND(amount?: number | null): string {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** (Tuỳ chọn) Format phút thành "1h 30m", "45m", ... */
export function formatMinutes(min?: number | null): string {
  if (!min || min <= 0) return "";
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}
