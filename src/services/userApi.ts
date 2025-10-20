// src/services/userApi.ts
import { authHttp } from "../services/http";

import type { AdminRole, User } from "../types/user/user";
import { normalizeApiDate } from "../Utils/datetime";

/** Raw item BE trả về (nhiều tên field khác nhau) */
interface RawUser {
  userId?: number;
  UserId?: number;
  id?: number;
  code?: string;
  Code?: string;
  fullName?: string;
  name?: string;
  FullName?: string;
  Name?: string;
  email?: string;
  Email?: string;
  emails?: Array<{ address?: string }>;
  Emails?: Array<{ Address?: string }>;
  phone?: string;
  Phone?: string;
  phones?: Array<{ number?: string }>;
  Phones?: Array<{ Number?: string }>;
  roles?: AdminRole[];
  Roles?: AdminRole[];
  isActive?: boolean;
  IsActive?: boolean;
  createdAt?: string;
  CreatedAt?: string;
}

/** Response kiểu list chuẩn hoá */
interface ListResp {
  success: boolean;
  message?: string;
  data?: {
    total?: number;
    page?: number;
    limit?: number;
    items?: RawUser[];
  };
}

const firstOrNull = (v: unknown): string | null =>
  typeof v === "string" ? v : null;

const normalizeUser = (raw: unknown): User => {
  const r = (raw ?? {}) as RawUser;

  const roles: AdminRole[] = Array.isArray(r.roles ?? r.Roles)
    ? ((r.roles ?? r.Roles) as AdminRole[])
    : [];

  const email =
    firstOrNull(r.email ?? r.Email) ??
    firstOrNull(r.emails?.[0]?.address) ??
    firstOrNull(r.Emails?.[0]?.Address);

  const phone =
    firstOrNull(r.phone ?? r.Phone) ??
    firstOrNull(r.phones?.[0]?.number) ??
    firstOrNull(r.Phones?.[0]?.Number);

  const id = r.userId ?? r.UserId ?? r.id ?? 0;

  const createdAtRaw = r.createdAt ?? r.CreatedAt ?? null;
  const createdAt = normalizeApiDate(createdAtRaw);

  return {
    id,
    code: r.code ?? r.Code ?? "",
    name: r.fullName ?? r.name ?? r.FullName ?? r.Name ?? "",
    email: email ?? null,
    phone: phone ?? null,
    roles,
    status: r.isActive ?? r.IsActive ? "active" : "inactive",
    createdAt,
  };
};

export async function getAllUsers(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: AdminRole;
}) {
  const { page = 1, limit = 10, keyword, role } = params ?? {};
  const res = await authHttp.get<ListResp>("/api/v1/admin/users", {
    params: { page, limit, keyword, role },
  });

  const payload = res.data?.data;
  const items = (payload?.items ?? []).map(normalizeUser);
  return {
    total: payload?.total ?? items.length,
    page: payload?.page ?? page,
    limit: payload?.limit ?? limit,
    items,
  };
}

export async function updateUserRoles(id: number, roles: AdminRole[]) {
  await authHttp.put(`/api/v1/admin/user-update/${id}`, { roles });
}

export async function disableUser(id: number) {
  await authHttp.delete(`/api/v1/admin/user-delete/${id}`);
}

// ✅ API mở/khoá mới
export async function setUserStatus(id: number, isActive: boolean) {
  await authHttp.patch(`/api/v1/admin/user-status/${id}`, { isActive });
}