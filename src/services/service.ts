// services/services.ts

import axios from "axios";
import type {
  ServiceID,
  ServiceStatus,
  ServiceItem,
  PagedResult,
} from "../types/serviceType/service";
import { authHttp, publicHttp } from "./http";

type ServiceListRaw = {
  success: boolean;
  message?: string;
  total: number;
  page: number;
  pageSize: number;
  // BE trả mảng item (camelCase hoặc PascalCase)
  data: unknown[];
};

// ---- helper: nhận cả camelCase lẫn PascalCase
const normalizeServiceItem = (raw: unknown): ServiceItem => {
  if (typeof raw !== "object" || raw === null) {
    return { serviceId: 0, name: "", basePrice: 0, isActive: false };
  }
  const r = raw as Record<string, unknown>;

  const getNum = (a?: unknown, b?: unknown, c?: unknown): number | undefined =>
    typeof a === "number"
      ? a
      : typeof b === "number"
      ? (b as number)
      : typeof c === "number"
      ? (c as number)
      : undefined;

  // Cho các field có thể NULL trong DB (code, description, imageUrl, category.imageUrl)
  const getStrNull = (a?: unknown, b?: unknown): string | null =>
    typeof a === "string" ? a : typeof b === "string" ? (b as string) : null;

  // Cho các field optional (createdAt, updatedAt)
  const getStrOpt = (a?: unknown, b?: unknown): string | undefined =>
    typeof a === "string"
      ? a
      : typeof b === "string"
      ? (b as string)
      : undefined;

  return {
    serviceId: getNum(r.serviceId, r.ServiceId, r.id) ?? 0,
    code: getStrNull(r.code, r.Code),
    name: (getStrNull(r.name, r.Name) ?? "") as string,
    description: getStrNull(r.description, r.Description),
    basePrice: (getNum(r.basePrice, r.BasePrice) ?? 0) as number,
    durationMin: getNum(r.durationMin, r.DurationMin) ?? null,
    isActive:
      typeof r.isActive === "boolean"
        ? r.isActive
        : typeof r.IsActive === "boolean"
        ? (r.IsActive as boolean)
        : false,

    imageUrl: getStrNull(r.imageUrl, r.ImageUrl),

    category: (() => {
      const c = (r.category ?? r.Category) as
        | Record<string, unknown>
        | null
        | undefined;
      if (!c || typeof c !== "object") return null;
      return {
        categoryId: getNum(c.categoryId, c.CategoryId) ?? 0,
        name: (getStrNull(c.name, c.Name) ?? "") as string,
        imageUrl: getStrNull(c.imageUrl, c.ImageUrl),
      };
    })(),

    // ✅ trả về string | undefined (không phải null) để khớp type
    createdAt: getStrOpt(r.createdAt, r.CreatedAt),
    updatedAt: getStrOpt(r.updatedAt, r.UpdatedAt),
  };
};

/** ====== PUBLIC ====== */
/** Danh sách dịch vụ công khai (phân trang) */
export async function getService(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: boolean;
}): Promise<PagedResult<ServiceItem>> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  if (params?.keyword) q.set("keyword", params.keyword);
  if (params?.isActive !== undefined)
    q.set("isActive", String(params.isActive));

  const { data } = await publicHttp.get(`/api/v1/services`, { params });
  const raw = data as ServiceListRaw;

  const items = (raw.data ?? []).map(normalizeServiceItem);

  return {
    success: raw.success,
    message: raw.message,
    data: {
      items,
      total: raw.total,
      page: raw.page,
      pageSize: raw.pageSize,
    },
  };
}

/** ====== ADMIN (cần token/role ADMIN) ====== */
/** Tạo dịch vụ */
export async function createService(payload: {
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice: number;
  durationMin?: number | null;
  categoryId: number;
  isActive: boolean;
  imageUrl?: string | null;
}): Promise<{ serviceId: number }> {
  const { data } = await authHttp.post(`/api/v1/services/add`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data?.data ?? data;
}

/** Cập nhật dịch vụ */
export async function updateService(
  id: ServiceID,
  payload: {
    code?: string | null;
    name: string;
    description?: string | null;
    basePrice: number;
    durationMin?: number | null;
    categoryId: number;
    isActive: boolean;
    imageUrl?: string | null;
  }
): Promise<void> {
  await authHttp.put(`/api/v1/services/update/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
}

/** Bật/tắt dịch vụ (map từ status kiểu union sang boolean isActive) */
export async function toggleService(
  id: ServiceID,
  status: ServiceStatus
): Promise<void> {
  const isActive = status === "active";
  await authHttp.patch(`/api/v1/services/status/${id}`, { isActive });
}

/** Xoá dịch vụ */

export async function deleteService(id: number) {
  try {
    await authHttp.delete(`/api/v1/services/remove/${id}`);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Xoá dịch vụ thất bại";
      throw new Error(msg);
    }
    throw new Error("Xoá dịch vụ thất bại");
  }
}
