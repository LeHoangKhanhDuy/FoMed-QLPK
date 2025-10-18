const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export async function fetchJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, init);
  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  if (!res.ok) {
    const msg = isJson
      ? (await res.json().catch(() => ({} as any)))?.message ?? res.statusText
      : res.statusText;
    throw new Error(msg);
  }
  if (!isJson) throw new Error("Expected JSON response");
  return res.json() as Promise<T>;
}
