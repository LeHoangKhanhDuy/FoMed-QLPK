// services/specialtyMApi.ts

import type {
  CreateSpecialtyPayload,
  SpecialtiesListResponse,
  SpecialtyItem,
  UpdateSpecialtyPayload,
} from "../types/specialty/specialtyType";
import axios from "axios";
import { authHttp, publicHttp } from "./http";
import { USER_TOKEN_KEY } from "./auth";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  Message?: string;
  data: T;
};

const PREFIX = "/api/v1/specialties";

function requireToken() {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (!token) throw new Error("Vui lòng đăng nhập");
}

function pickMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const p = payload as { message?: unknown; Message?: unknown };
  return (typeof p.message === "string" && p.message) ||
    (typeof p.Message === "string" && p.Message)
    ? String(p.message ?? p.Message)
    : undefined;
}

function throwAxiosError(e: unknown, fallback: string): never {
  if (axios.isAxiosError(e)) {
    const msg = pickMessage(e.response?.data) || e.message;
    throw new Error(msg || fallback);
  }
  throw new Error(fallback);
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
  requireToken();
  try {
    const { data } = await authHttp.get<ApiEnvelope<SpecialtiesListResponse>>(
      `${PREFIX}/admin/list`,
      { params }
    );
    return data.data;
  } catch (e) {
    throwAxiosError(e, "Không thể tải danh sách chuyên khoa");
  }
}

/**
 * Lấy danh sách chuyên khoa công khai (không cần auth)
 * Dùng cho DoctorModal dropdown
 */
export async function apiGetPublicSpecialties(): Promise<SpecialtyItem[]> {
  try {
    const { data } = await publicHttp.get<ApiEnvelope<SpecialtyItem[]>>(
      `${PREFIX}`,
      { params: { isActive: true } }
    );
    return data.data || [];
  } catch (e) {
    throwAxiosError(e, "Không thể tải danh sách chuyên khoa");
  }
}

/**
 * Lấy chi tiết chuyên khoa
 */
export async function apiGetSpecialtyDetail(
  specialtyId: number
): Promise<SpecialtyItem> {
  try {
    const { data } = await publicHttp.get<ApiEnvelope<SpecialtyItem>>(
      `${PREFIX}/${specialtyId}`
    );
    return data.data;
  } catch (e) {
    throwAxiosError(e, "Không thể tải thông tin chuyên khoa");
  }
}

/**
 * Tạo chuyên khoa mới (Admin)
 */
export async function apiCreateSpecialty(
  payload: CreateSpecialtyPayload
): Promise<{ specialtyId: number }> {
  requireToken();
  try {
    const { data } = await authHttp.post<ApiEnvelope<{ specialtyId: number }>>(
      `${PREFIX}/admin/create`,
      payload
    );
    return data.data;
  } catch (e) {
    throwAxiosError(e, "Không thể tạo chuyên khoa");
  }
}

/**
 * Cập nhật chuyên khoa (Admin)
 */
export async function apiUpdateSpecialty(
  specialtyId: number,
  payload: UpdateSpecialtyPayload
): Promise<void> {
  requireToken();
  try {
    await authHttp.put(`${PREFIX}/admin/${specialtyId}`, payload);
  } catch (e) {
    throwAxiosError(e, "Không thể cập nhật chuyên khoa");
  }
}

/**
 * Vô hiệu hóa chuyên khoa (Admin)
 */
export async function apiDeactivateSpecialty(
  specialtyId: number
): Promise<void> {
  requireToken();
  try {
    await authHttp.delete(`${PREFIX}/admin/${specialtyId}`);
  } catch (e) {
    throwAxiosError(e, "Không thể vô hiệu hóa chuyên khoa");
  }
}

/**
 * Kích hoạt lại chuyên khoa (Admin)
 */
export async function apiActivateSpecialty(specialtyId: number): Promise<void> {
  requireToken();
  try {
    await authHttp.patch(`${PREFIX}/admin/${specialtyId}/activate`);
  } catch (e) {
    throwAxiosError(e, "Không thể kích hoạt chuyên khoa");
  }
}
