// services/drugApi.ts
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
  Strength?: string;
  form?: string;
  Form?: string;
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

  physicalStock?: number;
  PhysicalStock?: number;

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

/* ===== TYPE DEFINITIONS BỔ SUNG CHO LÔ ===== */
export type DrugLot = {
  lotId: number;
  lotNumber: string;
  expiryDate: string | null;
  quantity: number;
  createdAt: string;
};

type LotCreateResp = {
  success?: boolean;
  message?: string;
  data?: { lotId: number; lotNumber: string };
};

type LotListResp = {
  success?: boolean;
  message?: string;
  data?: DrugLot[];
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

  // Helper lấy số an toàn
  const getNumber = (val: unknown) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const cleaned = val.replace(/[^0-9.-]+/g, "");
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const stock = getNumber(
    r.stock ?? r.Stock ?? (r as Record<string, unknown>).stock
  );
  const physicalStock = getNumber(r.physicalStock ?? r.PhysicalStock);

  const isActive = (r.isActive ?? r.IsActive) === true;

  return {
    id,
    code: r.code ?? r.Code ?? "",
    name: r.name ?? r.Name ?? "",
    unit: r.unit ?? r.Unit ?? "",
    price,
    stock,
    // Đảm bảo physicalStock logic hợp lý
    physicalStock: physicalStock > stock ? physicalStock : stock,
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
    isActive: payload.isActive,
  };

  const { data } = await authHttp.post<CreateDrugResp>(
    "/api/v1/admin/medicines/create",
    body
  );

  const newId = data?.data?.medicineId ?? data?.data?.id ?? 0;

  return {
    id: newId,
    code: payload.code,
    name: payload.name,
    unit: payload.unit,
    price: payload.price,
    stock: 0,
    physicalStock: 0,
    isActive: payload.isActive,
    status: "out of stock",
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
    isActive: payload.isActive,
  };

  await authHttp.put(`/api/v1/admin/medicines/update/${id}`, body);

  // Gọi lại API chi tiết để lấy stock mới nhất
  const updated = await apiGetDrugDetails(id);
  return updated;
}

/* ===== CẬP NHẬT TỒN KHO ===== */
export async function apiUpdateDrugInventory(
  id: number,
  params: {
    txnType: "in" | "out" | "adjust";
    quantity: number;
    lotId: number;
    unitCost?: number | null;
    refNote?: string | null;
  }
): Promise<{ medicineId: number; stock: number }> {
  const body = {
    txnType: params.txnType,
    quantity: params.quantity,
    unitCost: params.unitCost ?? null,
    lotId: params.lotId,
    refNote: params.refNote ?? null,
  };

  const { data } = await authHttp.post(
    `/api/v1/admin/medicines/inventory/${id}`,
    body
  );

  return data?.data ?? { medicineId: id, stock: 0 };
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

/* ===== API QUẢN LÝ LÔ THUỐC ===== */
export async function apiGetDrugLots(drugId: number): Promise<DrugLot[]> {
  const { data } = await authHttp.get<LotListResp>(
    `/api/v1/admin/medicines/${drugId}/lots`
  );
  return data?.data ?? [];
}

export async function apiCreateDrugLot(
  drugId: number,
  payload: { lotNumber: string; expiryDate?: string | null; quantity?: number }
): Promise<DrugLot> {
  const body = {
    lotNumber: payload.lotNumber,
    expiryDate: payload.expiryDate ?? null,
    quantity: payload.quantity ?? 0,
  };

  const { data } = await authHttp.post<LotCreateResp>(
    `/api/v1/admin/medicines/${drugId}/lots`,
    body
  );

  return {
    lotId: data?.data?.lotId ?? 0,
    lotNumber: body.lotNumber,
    expiryDate: body.expiryDate || null,
    quantity: body.quantity,
    createdAt: new Date().toISOString(),
  };
}
