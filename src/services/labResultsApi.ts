// src/services/labResultsApi.ts
import { authHttp } from "./http";

/* ===== Types ===== */
export type LabStatus =
  | "pending"
  | "processing"
  | "completed"
  | "abnormal"
  | "canceled";

/** Item BE trả về (có thể thiếu field) */
type BELabResultItem = Partial<{
  id: number;
  code: string;
  sampleTakenAt: string;
  serviceName: string;
  status: string;
}>;

/** Shape phân trang BE */
type BELabResultsPage = Partial<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: BELabResultItem[];
}>;

export interface LabResultItem {
  id: number;
  code: string;
  sampleTakenAt: string;
  serviceName: string;
  status: LabStatus;
}

export interface LabResultsPage {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: LabResultItem[];
}

export const PREFIX = "/api/v1/lab-results";

/** Chuẩn hóa status từ BE -> FE */
export function normalizeLabStatus(s?: string | null): LabStatus {
  const x = (s ?? "").toLowerCase().trim();
  switch (x) {
    case "completed":
    case "normal":
    case "done":
      return "completed";
    case "processing":
      return "processing";
    case "abnormal":
      return "abnormal";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "pending":
    case "waiting":
    default:
      return "pending";
  }
}

/* ===== API ===== */
export async function apiGetLabResults(
  params: {
    patientId?: number;
    patientCode?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<LabResultsPage> {
  const { data } = await authHttp.get(PREFIX, { params });
  // API: { success, message, data: {...} }
  const d: BELabResultsPage = data?.data ?? {};

  const srcItems: BELabResultItem[] = Array.isArray(d.items) ? d.items : [];
  const items: LabResultItem[] = srcItems.map((it, idx) => ({
    id: typeof it.id === "number" ? it.id : idx + 1,
    code: it.code ?? "-",
    sampleTakenAt: it.sampleTakenAt ?? "",
    serviceName: it.serviceName ?? "(Không rõ dịch vụ)",
    status: normalizeLabStatus(it.status),
  }));

  return {
    page: d.page ?? 1,
    limit: d.limit ?? 10,
    totalItems: d.totalItems ?? items.length,
    totalPages: d.totalPages ?? 1,
    items,
  };
}
