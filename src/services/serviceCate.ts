import { authHttp } from "./http";

/** ==== Types ==== */
export interface ServiceCategory {
  categoryId: number;
  code: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceCategoryListParams = {
  keyword?: string;
  isActive?: boolean | null; // true | false | null (tất cả)
  page?: number;
  limit?: number;
};

export interface PagedResult<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
}

/** ==== Helpers: chấp nhận cả camelCase / PascalCase từ BE ==== */
const pick = (obj: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  }
  return undefined;
};

const normalizeCategory = (raw: unknown): ServiceCategory => {
  if (!raw || typeof raw !== "object") {
    return {
      categoryId: 0,
      code: null,
      name: "",
      description: null,
      isActive: false,
    };
  }
  const r = raw as Record<string, unknown>;
  return {
    categoryId: Number(pick(r, ["categoryId", "CategoryId"])) || 0,
    code: (pick(r, ["code", "Code"]) as string | null | undefined) ?? null,
    name: String(pick(r, ["name", "Name"]) ?? ""),
    description:
      (pick(r, ["description", "Description"]) as string | null | undefined) ??
      null,
    isActive: Boolean(pick(r, ["isActive", "IsActive"])),
    createdAt:
      (pick(r, ["createdAt", "CreatedAt"]) as string | undefined) ?? undefined,
    updatedAt:
      (pick(r, ["updatedAt", "UpdatedAt"]) as string | undefined) ?? undefined,
  };
};

/** ==== API: GET /api/v1/admin/categories ==== */
export async function apiListServiceCategories(
  params: ServiceCategoryListParams = {}
): Promise<PagedResult<ServiceCategory>> {
  const { keyword, isActive, page = 1, limit = 100 } = params;

  const { data } = await authHttp.get("/api/v1/admin/categories", {
    params: {
      keyword: keyword?.trim() || undefined,
      // Chỉ gửi isActive khi là true/false rõ ràng; nếu null/undefined thì bỏ
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      page,
      limit,
    },
  });

  // BE có thể trả về các cấu trúc khác nhau; map an toàn
  const payload = data?.data?.items
    ? {
        page: Number(data.data.page ?? page),
        limit: Number(data.data.limit ?? limit),
        total: Number(data.data.total ?? 0),
        totalPages: Number(data.data.totalPages ?? 1),
        items: (data.data.items as unknown[]).map(normalizeCategory),
      }
    : {
        page,
        limit,
        total: Array.isArray(data?.data) ? data.data.length : 0,
        totalPages: 1,
        items: (Array.isArray(data?.data) ? data.data : []).map(
          normalizeCategory
        ),
      };

  return payload;
}
