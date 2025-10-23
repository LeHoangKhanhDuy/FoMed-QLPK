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
