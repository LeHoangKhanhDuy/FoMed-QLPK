// services/services.ts

import axios from "axios";
import type {
  ServiceID,
  CreateServicePayload,
  UpdateServicePayload,
  ServiceStatus,
  ServiceItem,
  PagedResult,
} from "../types/service";

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
    return { serviceId: 0, name: "", isActive: false };
  }
  const r = raw as Record<string, unknown>;

  const getNum = (a?: unknown, b?: unknown, c?: unknown) =>
    typeof a === "number"
      ? a
      : typeof b === "number"
      ? (b as number)
      : typeof c === "number"
      ? (c as number)
      : undefined;

  const getStr = (a?: unknown, b?: unknown) =>
    typeof a === "string"
      ? a
      : typeof b === "string"
      ? (b as string)
      : undefined;

  const getBool = (a?: unknown, b?: unknown) =>
    typeof a === "boolean"
      ? a
      : typeof b === "boolean"
      ? (b as boolean)
      : undefined;

  return {
    serviceId: getNum(r.serviceId, r.ServiceId, r.id) ?? 0,
    code: getStr(r.code, r.Code) ?? null,
    name: getStr(r.name, r.Name) ?? "",
    description: getStr(r.description, r.Description) ?? null,
    basePrice: getNum(r.basePrice, r.BasePrice) ?? null,
    durationMin: getNum(r.durationMin, r.DurationMin) ?? null,
    isActive: getBool(r.isActive, r.IsActive) ?? false,

    // >>> THÊM: map ảnh dịch vụ
    imageUrl: getStr(r.imageUrl, r.ImageUrl) ?? null,

    // >>> map category (kèm ảnh)
    category: (() => {
      const c = (r.category ?? r.Category) as
        | Record<string, unknown>
        | null
        | undefined;
      if (!c || typeof c !== "object") return null;
      return {
        categoryId: getNum(c.categoryId, c.CategoryId) ?? 0,
        name: getStr(c.name, c.Name) ?? "",
        imageUrl: getStr(c.imageUrl, c.ImageUrl) ?? null, // <<< THÊM
      };
    })(),

    // >>> Đọc thêm PascalCase nếu BE trả theo kiểu C#
    createdAt: getStr(r.createdAt, r.CreatedAt),
    updatedAt: getStr(r.updatedAt, r.UpdatedAt),
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

  const url = `/api/v1/services${q.toString() ? `?${q.toString()}` : ""}`;
  const { data } = await axios.get(url);
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
export async function createService(
  payload: CreateServicePayload
): Promise<{ serviceId: number }> {
  const { data } = await axios.post(`/api/v1/services/add`, payload);
  return data?.data ?? data; 
}

/** Cập nhật dịch vụ */

export async function updateService(
  id: ServiceID,
  payload: UpdateServicePayload
): Promise<void> {
  await axios.put(`/api/v1/services/update/${id}`, payload);
}

/** Bật/tắt dịch vụ (map từ status kiểu union sang boolean isActive) */
export async function toggleService(
  id: ServiceID,
  status: ServiceStatus
): Promise<void> {
  const isActive = status === "active";
  await axios.patch(`/api/v1/services/status/${id}`, { isActive });
}

/** Xoá dịch vụ */
export async function deleteService(id: ServiceID): Promise<void> {
  await axios.delete(`/api/v1/services/remove/${id}`);
}
