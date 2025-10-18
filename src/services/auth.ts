// services/auth.ts
import axios from "axios";
import type { AppUser, LoginNormalized } from "../types/auth/login";

/* ============ CONFIG ============ */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export const USER_TOKEN_KEY = "userToken"; // accessToken
export const USER_REFRESH_TOKEN_KEY = "userRefreshToken"; // refreshToken
export const USER_INFO_KEY = "userInfo";

const publicHttp = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

const authHttp = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token?: string) {
  if (token) authHttp.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete authHttp.defaults.headers.common.Authorization;
}

/* ============ STORAGE ============ */
export function readUserFromStorage(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Partial<AppUser>;
    return {
      userId: Number(obj.userId ?? 0),
      email: String(obj.email ?? ""),
      name: String(obj.name ?? obj.email ?? ""),
      phone: String(obj.phone ?? ""),
      roles: Array.isArray(obj.roles) ? obj.roles : [],
    };
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: AppUser, refreshToken?: string) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(USER_REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  setAuthToken(token);
  window.dispatchEvent(new Event("auth:updated"));
}

export function clearAuth() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_REFRESH_TOKEN_KEY); 
  localStorage.removeItem(USER_INFO_KEY);
  setAuthToken(undefined);
  window.dispatchEvent(new Event("auth:updated"));
}

export function ensureAuthFromStorage() {
  const t = localStorage.getItem(USER_TOKEN_KEY) || undefined;
  setAuthToken(t);
}

/* ============ BE TYPES ============ */
interface LoginResponseData {
  token?: string;
  Token?: string;
  expiresAt?: string;
  ExpiresAt?: string;
  refreshToken?: string;
  RefreshToken?: string;
  fullName?: string;
  FullName?: string;
  email?: string;
  Email?: string;
  phone?: string;
  Phone?: string;
  roles?: string[];
  Roles?: string[];
}

interface BeLoginResponse {
  status?: boolean;
  Status?: boolean;
  statusCode?: number;
  StatusCode?: number;
  message?: string;
  Message?: string;
  data?: LoginResponseData;
  Data?: LoginResponseData;
}

interface ProfileResponseData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  joinDate?: string | null;
  joinedAt?: string | null;
  createdOn?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  bio?: string | null;
  profileUpdatedAt?: string | null;
}

interface BeProfileResponse {
  message: string;
  data?: ProfileResponseData;
}

/* ============ MAPPERS ============ */
function mapUserFromLogin(
  responseData: LoginResponseData | undefined
): AppUser {
  if (!responseData) {
    return {
      userId: 0,
      email: "",
      name: "",
      phone: "",
      roles: [],
    };
  }

  return {
    userId: 0, // Login không trả userId
    email: responseData.email || responseData.Email || "",
    name:
      responseData.fullName ||
      responseData.FullName ||
      responseData.email ||
      responseData.Email ||
      "",
    phone: responseData.phone || responseData.Phone || "",
    roles: Array.isArray(responseData.roles)
      ? responseData.roles
      : Array.isArray(responseData.Roles)
      ? responseData.Roles
      : [],
  };
}

function mapUserFromProfile(p?: ProfileResponseData): AppUser {
  if (!p) throw new Error("Profile data is null");
  return {
    userId: Number(p.id ?? 0),
    email: p.email ?? "",
    name: p.name ?? p.email ?? "",
    phone: p.phone ?? "",
    roles: [],
    createdAt: p.createdAt ?? p.created_at ?? p.joinDate ?? undefined, // nhận từ BE
    avatarUrl: p.avatarUrl ?? null,
  };
}

function normalizeLogin(response: BeLoginResponse): LoginNormalized {
  const status = response.status ?? response.Status ?? false;
  const data = response.data || response.Data;

  const token = data?.token || data?.Token;
  const refreshToken = data?.refreshToken || data?.RefreshToken;

  return {
    status: Boolean(status),
    status_code: response.statusCode ?? response.StatusCode ?? 200,
    message: response.message ?? response.Message,
    token,
    refreshToken,
    user: mapUserFromLogin(data),
  };
}

/* ============ API CALLS ============ */
export async function register(email: string, password: string, name: string) {
  const { data } = await publicHttp.post(
    "/api/v1/accounts/register-with-email",
    { email, password, fullName: name }
  );
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<LoginNormalized> {
  // Xóa auth headers trước khi login
  delete publicHttp.defaults.headers.common.Authorization;
  delete authHttp.defaults.headers.common.Authorization;

  const { data } = await publicHttp.post<BeLoginResponse>(
    "/api/v1/accounts/login-with-email",
    { email, password }
  );

  const normalized = normalizeLogin(data);

  // Kiểm tra response
  if (!normalized.status) {
    throw new Error(normalized.message || "Đăng nhập thất bại");
  }

  if (!normalized.token) {
    throw new Error("Không nhận được token từ server");
  }

  return normalized;
}

export async function getProfile(token: string): Promise<AppUser> {
  // API /profile yêu cầu gửi token trong BODY
  const { data } = await publicHttp.post<BeProfileResponse>(
    "/api/v1/accounts/profile",
    { token }
  );

  console.log("👤 Profile response:", JSON.stringify(data, null, 2));

  if (!data.data) {
    throw new Error(data.message ?? "Không thể lấy thông tin người dùng");
  }

  const user = mapUserFromProfile(data.data);

  // Lấy roles từ storage (đã lưu từ login)
  const storedUser = readUserFromStorage();
  if (storedUser?.roles?.length) {
    user.roles = storedUser.roles;
  }

  return user;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = localStorage.getItem(USER_REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await publicHttp.post("/api/v1/accounts/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    clearAuth();
  }
}

/* Chạy 1 lần khi file được import */
ensureAuthFromStorage();
