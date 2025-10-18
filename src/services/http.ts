// src/utils/http.ts
import axios from "axios";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  ""
);

export const publicHttp = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});
// client cho các request cần Bearer (gán token khi đăng nhập xong)
export const authHttp = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token?: string) {
  if (token)
    authHttp.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete authHttp.defaults.headers.common["Authorization"];
}
