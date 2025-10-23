// services/auth.ts
import axios, { isAxiosError } from "axios";
import type { AppUser, LoginNormalized } from "../types/auth/login";
import { getErrorMessage } from "../Utils/errorHepler";

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
      createdAt: obj.createdAt ?? undefined,
      avatarUrl: obj.avatarUrl ?? null,
    };
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: AppUser, refreshToken?: string) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(USER_REFRESH_TOKEN_KEY, refreshToken);

  const prev = readUserFromStorage();
  const merged: AppUser = {
    userId: user.userId ?? prev?.userId ?? 0,
    email: user.email ?? prev?.email ?? "",
    name: user.name ?? prev?.name ?? user.email ?? "",
    phone: user.phone ?? prev?.phone ?? "",
    roles: user.roles?.length ? user.roles : prev?.roles ?? [],
    createdAt: user.createdAt ?? prev?.createdAt,
    avatarUrl: user.avatarUrl ?? prev?.avatarUrl ?? null,
  };

  localStorage.setItem(USER_INFO_KEY, JSON.stringify(merged));
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
  userId?: number;
  UserId?: number;
}

interface BeLoginResponse {
  Status?: boolean;
  status?: boolean;
  StatusCode?: number;
  statusCode?: number;
  Message?: string;
  message?: string;
  Data?: LoginResponseData;
  data?: LoginResponseData;
  Errors?: Record<string, string[]>;
  errors?: Record<string, string[]>;
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
  message?: string;
  Message?: string;
  data?: ProfileResponseData;
  Data?: ProfileResponseData;
}

/* ============ MAPPERS ============ */
function mapUserFromLogin(d?: LoginResponseData): AppUser {
  if (!d) {
    return { userId: 0, email: "", name: "", phone: "", roles: [] };
  }
  return {
    userId: d.userId ?? d.UserId ?? 0,
    email: d.email || d.Email || "",
    name: d.fullName || d.FullName || d.email || d.Email || "",
    phone: d.phone || d.Phone || "",
    roles: Array.isArray(d.roles)
      ? (d.roles as AppUser["roles"])
      : Array.isArray(d.Roles)
      ? (d.Roles as AppUser["roles"])
      : [],
  };
}

function mapUserFromProfile(p?: ProfileResponseData): AppUser {
  if (!p) throw new Error("Profile data is null");

  const created =
    p.createdAt ??
    p.created_at ??
    p.joinDate ??
    p.joinedAt ??
    p.createdOn ??
    p.profileUpdatedAt ??
    null;

  return {
    userId: Number(p.id ?? 0),
    email: p.email ?? "",
    name: p.name ?? p.email ?? "",
    phone: p.phone ?? "",
    roles: [],
    createdAt: created ?? undefined,
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
  const payload = {
    FullName: name.trim(),
    Email: email.trim(),
    Password: password,
  };

  try {
    const { data } = await publicHttp.post(
      "/api/v1/accounts/register-with-email",
      payload
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; errors?: Record<string, string[]> }
        | undefined;

      const msg =
        data?.message ??
        (data?.errors
          ? Object.values(data.errors).flat().join("; ")
          : undefined) ??
        "Đăng ký thất bại.";

      throw new Error(msg);
    }
    throw error;
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginNormalized> {
  // Xoá header cũ (nếu có)
  delete publicHttp.defaults.headers.common.Authorization;
  delete authHttp.defaults.headers.common.Authorization;

  try {
    const { data } = await publicHttp.post<BeLoginResponse>(
      "/api/v1/accounts/login-with-email",
      { email, password }
    );
    const normalized = normalizeLogin(data);

    if (!normalized.status) {
      // BE có thể trả Message cụ thể cho 401/403/423
      throw new Error(normalized.message || "Đăng nhập thất bại");
    }
    if (!normalized.token) {
      throw new Error("Không nhận được token từ server");
    }
    return normalized;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const be = error.response?.data as BeLoginResponse | undefined;

      // Ưu tiên Message từ BE
      const beMsg = be?.Message ?? be?.message;

      // Map status thường gặp để UX rõ ràng (nếu BE không có Message)
      const fallback =
        status === 401
          ? "Email hoặc mật khẩu không đúng."
          : status === 403
          ? "Tài khoản đã bị vô hiệu hoá."
          : status === 423
          ? "Tài khoản đang bị khoá."
          : "Đăng nhập thất bại.";

      throw new Error(beMsg || fallback);
    }

    throw new Error(getErrorMessage(error, "Đăng nhập thất bại."));
  }
}

export async function getProfile(token: string): Promise<AppUser> {
  setAuthToken(token);
  try {
    const { data } = await authHttp.post<BeProfileResponse>(
      "/api/v1/accounts/profile",
      {}
    );
    if (!data.data)
      throw new Error(data.message ?? "Không thể lấy thông tin người dùng");

    const user = mapUserFromProfile(data.data);

    // Gắn lại roles từ cache nếu BE chưa trả
    const stored = readUserFromStorage();
    if (stored?.roles?.length) user.roles = stored.roles;

    // Lưu lại cache để lần sau có createdAt
    const tokenStr = localStorage.getItem(USER_TOKEN_KEY) || token;
    saveAuth(tokenStr, user);

    return user;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 401) {
      throw new Error("401");
    }
    const cached = readUserFromStorage();
    if (cached) return cached;
    throw error;
  }
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

// ===== UPLOAD AVATAR =====
export async function uploadAvatar(file: File): Promise<string> {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (!token) throw new Error("Bạn chưa đăng nhập.");

  // tạo form data
  const formData = new FormData();
  formData.append("File", file); // tên field phải khớp với [FromForm] AvatarUploadRequest.File

  // axios instance có header Authorization sẵn
  setAuthToken(token);

  try {
    const { data } = await authHttp.post("/api/v1/accounts/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!data?.data?.avatarUrl)
      throw new Error(data?.message || "Không nhận được URL ảnh từ server.");

    // lưu avatar mới vào localStorage (nếu muốn cập nhật UI tức thì)
    const user = readUserFromStorage();
    if (user) {
      user.avatarUrl = data.data.avatarUrl;
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event("auth:updated"));
    }

    return data.data.avatarUrl;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Tải ảnh thất bại từ server.";
      throw new Error(message);
    }

    console.error("Unknown upload avatar error:", error);
    throw new Error("Tải ảnh thất bại.");
  }
}

/* Chạy 1 lần khi file được import */
ensureAuthFromStorage();
