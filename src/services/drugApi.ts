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

  const stock = (() => {
    const raw =
      r.stock ??
      r.Stock ??
      (typeof (r as Record<string, unknown>).stock === "string"
        ? (r as Record<string, unknown>).stock
        : undefined);

    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const cleaned = raw.replace(/[^0-9.-]+/g, "");
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  })();

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
    // KHÔNG gửi stock - BE không nhận field này
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
    stock: 0, // Mới tạo luôn = 0
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
    // KHÔNG gửi stock - BE không nhận field này
    isActive: payload.isActive,
  };

  // Gửi request update
  await authHttp.put(`/api/v1/admin/medicines/update/${id}`, body);

  // Lấy lại thông tin chi tiết từ server để có stock mới nhất
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

// 1. Lấy danh sách lô của 1 thuốc
export async function apiGetDrugLots(drugId: number): Promise<DrugLot[]> {
  const { data } = await authHttp.get<LotListResp>(
    `/api/v1/admin/medicines/${drugId}/lots`
  );
  return data?.data ?? [];
}

// 2. Tạo lô mới
export async function apiCreateDrugLot(
  drugId: number,
  payload: { lotNumber: string; expiryDate?: string | null; quantity?: number }
): Promise<DrugLot> {
  const body = {
    lotNumber: payload.lotNumber,
    expiryDate: payload.expiryDate ?? null,
    quantity: payload.quantity ?? 0, // Thường là 0, nhập kho sau
  };

  const { data } = await authHttp.post<LotCreateResp>(
    `/api/v1/admin/medicines/${drugId}/lots`,
    body
  );

  // Trả về object DrugLot giả lập để UI dùng ngay (vì BE chỉ trả ID)
  return {
    lotId: data?.data?.lotId ?? 0,
    lotNumber: body.lotNumber,
    expiryDate: body.expiryDate || null,
    quantity: body.quantity,
    createdAt: new Date().toISOString(),
  };
}