// src/utils/datetime.ts
export function normalizeApiDate(input: unknown): string | null {
  if (typeof input !== "string" || !input.trim()) return null;
  const s = input.trim();

  // thử parse trực tiếp
  let d = new Date(s);
  if (Number.isFinite(d.getTime())) return d.toISOString();

  // format phổ biến: "YYYY-MM-DD HH:mm:ss" hoặc "YYYY-MM-DDTHH:mm:ss"
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (m) {
    const [, Y, M, D, h, mnt, ss] = m;
    d = new Date(Date.UTC(+Y, +M - 1, +D, +h, +mnt, +(ss || "0")));
    if (Number.isFinite(d.getTime())) return d.toISOString();
  }

  // timestamp milliseconds (13 chữ số)
  if (/^\d{13}$/.test(s)) {
    d = new Date(parseInt(s, 10));
    if (Number.isFinite(d.getTime())) return d.toISOString();
  }

  return null;
}

/**
 * Format datetime từ backend sang định dạng DD/MM/YYYY HH:mm:ss
 * VD: "2025-10-27T15:30:24" -> "27/10/2025 15:30:24"
 */
export function formatDateTime(input: string | null | undefined): string {
  if (!input) return "-";
  
  try {
    const date = new Date(input);
    if (!Number.isFinite(date.getTime())) return "-";
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return "-";
  }
}