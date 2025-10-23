// services/specialtyMApi.ts

import type { CreateSpecialtyPayload, SpecialtiesListResponse, SpecialtyItem, UpdateSpecialtyPayload } from "../types/specialty/specialtyType";
import { USER_TOKEN_KEY } from "./auth";

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "")}/api/v1/specialties`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(USER_TOKEN_KEY);

  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Lấy danh sách chuyên khoa (Admin) - có phân trang
 */
export async function apiGetSpecialties(params: {
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}): Promise<SpecialtiesListResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  if (params.search) {
    query.set("search", params.search);
  }

  const res = await fetch(`${API_BASE}/admin/list?${query}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách chuyên khoa");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Lấy danh sách chuyên khoa công khai (không cần auth)
 * Dùng cho DoctorModal dropdown
 */
export async function apiGetPublicSpecialties(): Promise<SpecialtyItem[]> {
  const res = await fetch(`${API_BASE}?isActive=true`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách chuyên khoa");
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Lấy chi tiết chuyên khoa
 */
export async function apiGetSpecialtyDetail(
  specialtyId: number
): Promise<SpecialtyItem> {
  const res = await fetch(`${API_BASE}/${specialtyId}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải thông tin chuyên khoa");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Tạo chuyên khoa mới (Admin)
 */
export async function apiCreateSpecialty(
  payload: CreateSpecialtyPayload
): Promise<{ specialtyId: number }> {
  const res = await fetch(`${API_BASE}/admin/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tạo chuyên khoa");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Cập nhật chuyên khoa (Admin)
 */
export async function apiUpdateSpecialty(
  specialtyId: number,
  payload: UpdateSpecialtyPayload
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${specialtyId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể cập nhật chuyên khoa");
  }
}

/**
 * Vô hiệu hóa chuyên khoa (Admin)
 */
export async function apiDeactivateSpecialty(
  specialtyId: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${specialtyId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể vô hiệu hóa chuyên khoa");
  }
}

/**
 * Kích hoạt lại chuyên khoa (Admin)
 */
export async function apiActivateSpecialty(specialtyId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${specialtyId}/activate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể kích hoạt chuyên khoa");
  }
}
