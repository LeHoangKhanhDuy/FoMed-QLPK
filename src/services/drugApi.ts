import axios from "axios";
import { authHttp } from "../services/http";
import type { DrugItem } from "../types/drug/drug";

/* ===== RAW types từ BE ===== */
type RawMedicine = {
  medicineId?: number;
  MedicineId?: number;
  id?: number;
  code?: string;
  Code?: string;
  name?: string;
  Name?: string;
  strength?: string;
  Strength?: string; // không dùng nhưng giữ phòng sau
  form?: string;
  Form?: string; // không dùng nhưng giữ phòng sau
  unit?: string;
  Unit?: string;
  note?: string;
  Note?: string;

  basePrice?: number;
  BasePrice?: number;
  price?: number;
  Price?: number;
  stock?: number;
  Stock?: number;

  isActive?: boolean;
  IsActive?: boolean;

  createdAt?: string;
  CreatedAt?: string;
};

type ListResp = {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    page?: number;
    pageSize?: number;
    limit?: number;
    totalItems?: number;
    total?: number;
    totalPages?: number;
    items?: RawMedicine[];
  };
};

type ItemResp = {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: RawMedicine;
};

type CreateDrugResp = {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: { medicineId?: number; id?: number };
};

/* ===== Chuẩn hoá về DrugItem ===== */
const normalize = (r: RawMedicine): DrugItem => {
  const id = r.medicineId ?? r.MedicineId ?? r.id ?? 0;

  const price = (
    typeof r.basePrice === "number"
      ? r.basePrice
      : typeof r.BasePrice === "number"
      ? r.BasePrice
      : typeof r.price === "number"
      ? r.price
      : typeof r.Price === "number"
      ? r.Price
      : 0
  ) as number;

  const stock = (
    typeof r.stock === "number"
      ? r.stock
      : typeof r.Stock === "number"
      ? r.Stock
      : 0
  ) as number;

  const isActive = (r.isActive ?? r.IsActive) === true;

  return {
    id,
    code: r.code ?? r.Code ?? "",
    name: r.name ?? r.Name ?? "",
    unit: r.unit ?? r.Unit ?? "",
    price,
    stock,
    // Trạng thái tồn kho suy theo stock
    status: stock > 0 ? "in stock" : "out of stock",
    isActive,
    createdAt: (r.createdAt ?? r.CreatedAt ?? null) || null,
  };
};

/* ===== LIST ===== */
export async function apiListDrugs(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
}) {
  const { page = 1, limit = 20, keyword } = params ?? {};
  const res = await authHttp.get<ListResp>("/api/v1/admin/medicines", {
    params: { page, limit, keyword },
  });
  const payload = res.data?.data;
  const items = (payload?.items ?? []).map(normalize);
  return {
    total: payload?.totalItems ?? payload?.total ?? items.length,
    page: payload?.page ?? page,
    limit: payload?.pageSize ?? payload?.limit ?? limit,
    items,
  };
}

/* ===== DETAILS ===== */
export async function apiGetDrugDetails(id: number): Promise<DrugItem> {
  const { data } = await authHttp.get<ItemResp>(
    `/api/v1/admin/medicines/details/${id}`
  );
  return normalize(data?.data ?? {});
}

/* ===== CREATE ===== */
export async function apiCreateDrug(
  payload: Omit<DrugItem, "id" | "createdAt" | "status">
): Promise<DrugItem> {
  const body = {
    code: payload.code,
    name: payload.name,
    unit: payload.unit,
    basePrice: payload.price,
    stock: payload.stock,
    isActive: payload.isActive, // trạng thái hoạt động
  };

  const { data } = await authHttp.post<CreateDrugResp>(
    "/api/v1/admin/medicines/create",
    body
  );

  const newId = data?.data?.medicineId ?? data?.data?.id ?? 0;

  return {
    id: newId,
    ...payload,
    status: payload.stock > 0 ? "in stock" : "out of stock",
    createdAt: null,
  };
}

/* ===== UPDATE ===== */
export async function apiUpdateDrug(
  id: number,
  payload: Omit<DrugItem, "id" | "createdAt" | "status">
): Promise<DrugItem> {
  const body = {
    code: payload.code,
    name: payload.name,
    unit: payload.unit,
    basePrice: payload.price,
    stock: payload.stock,
    isActive: payload.isActive,
  };
  await authHttp.put(`/api/v1/admin/medicines/update/${id}`, body);

  return {
    id,
    ...payload,
    status: payload.stock > 0 ? "in stock" : "out of stock",
    createdAt: null,
  };
}

/* ===== BẬT/TẮT HOẠT ĐỘNG ===== */
export async function apiToggleDrugActive(id: number, active: boolean) {
  await authHttp.patch(`/api/v1/admin/medicines/active/${id}`, null, {
    params: { value: active },
  });
}

/* ===== DELETE ===== */
export async function apiDeleteDrug(id: number): Promise<void> {
  try {
    await authHttp.delete(`/api/v1/admin/medicines/remove/${id}`);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const msg =
        (e.response?.data as { message?: string })?.message ||
        e.message ||
        "Xoá thuốc thất bại";
      throw new Error(msg);
    }
    throw e;
  }
}
