/** Date helpers (YYYY-MM-DD, tuần, so sánh, format VN) */

export function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfWeek(d: Date): Date {
  // Tuần bắt đầu từ Thứ 2
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // về Monday
  const res = new Date(d);
  res.setDate(d.getDate() + diff);
  res.setHours(0, 0, 0, 0);
  return res;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}

export function todayOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toYMD(d);
}

export function isSameDay(ymdA: string, ymdB: string) {
  return ymdA === ymdB;
}

export function formatVNDate(ymd: string) {
  const d = new Date(ymd);
  return d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}
