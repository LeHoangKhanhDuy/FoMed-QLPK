import type { PharmacySummaryResponse } from "../types/dashboard/dashboard";
import { authHttp } from "./http";

// Vietnamese month names used as fallback when API doesn't provide MonthName
const VN_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

// =================== TYPES ===================
export interface VisitDailyPoint {
  date: string;
  count: number;
}

export interface VisitTotalResponse {
  success: boolean;
  from: string;
  to: string;
  timezone: string;
  totalAllTime: number;
  totalInRange: number;
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  daily: VisitDailyPoint[];
}

export interface DoctorTotalResponse {
  success: boolean;
  totalAll: number;
  totalActive: number;
  totalInactive: number;
}

export interface PatientTotalResponse {
  success: boolean;
  from: string;
  to: string;
  totalAll: number;
  newInRange: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
}

export interface MonthlySalePoint {
  month: number; // 1..12
  monthName: string; // "Jan", "Feb", ...
  revenue: number; // decimal
  visitCount: number; // int
}

export interface MonthlySalesResponse {
  success: boolean;
  year: number;
  totalRevenue: number;
  currentMonthRevenue: number;
  monthOverMonthChange: number; // %
  avgMonthlyRevenue: number;
  monthly: MonthlySalePoint[];
}

type RawMonthlyItem = {
  month?: number;
  Month?: number;
  monthName?: string;
  MonthName?: string;
  revenue?: number;
  Revenue?: number;
  visitCount?: number;
  VisitCount?: number;
};
type RawMonthlySalesResponse = {
  success?: boolean;
  Success?: boolean;
  year?: number;
  Year?: number;
  totalRevenue?: number;
  TotalRevenue?: number;
  currentMonthRevenue?: number;
  CurrentMonthRevenue?: number;
  monthOverMonthChange?: number;
  MonthOverMonthChange?: number;
  avgMonthlyRevenue?: number;
  AvgMonthlyRevenue?: number;
  monthly?: RawMonthlyItem[];
  Monthly?: RawMonthlyItem[];
};

export interface MonthlyTargetResponse {
  success: boolean;
  year: number;
  month: number;
  targetRevenue: number;
  actualRevenue: number;
  progressPercent: number; // 0..100
}

type RawPharmacySummaryResponse = {
  success?: boolean;
  totalActiveMedicines?: number;
  totalStockValue?: number;
  lowStockItemsCount?: number;
  expiringSoonCount?: number;
  lowStockItems?: Array<{
    medicineId?: number;
    name?: string;
    totalQuantity?: number;
    unit?: string;
  }>;
  expiringLots?: Array<{
    lotId?: number;
    medicineName?: string;
    lotNumber?: string;
    quantity?: number;
    expiryDate?: string;
    daysUntilExpiry?: number;
  }>;
};

const parseNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.-]+/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const parseDateLoose = (s?: string): Date | null => {
  if (!s) return null;

  // dd/MM/yyyy (API screenshot)
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // ISO or other Date-parsable string
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysUntil = (target: Date): number => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
// =================== API FUNCTIONS ===================

/**
 * Thống kê tổng số lượt khám (Appointments.Status = done)
 */
export async function getVisitTotals(params?: {
  from?: string; // yyyy-MM-dd
  to?: string; // yyyy-MM-dd
  doctorId?: number;
  serviceId?: number;
}): Promise<VisitTotalResponse> {
  const searchParams = new URLSearchParams();

  if (params?.from) searchParams.append("from", params.from);
  if (params?.to) searchParams.append("to", params.to);
  if (params?.doctorId)
    searchParams.append("doctorId", params.doctorId.toString());
  if (params?.serviceId)
    searchParams.append("serviceId", params.serviceId.toString());

  const url = `/api/v1/dashboard/visits${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const res = await authHttp.get<VisitTotalResponse>(url);
  return res.data;
}

/**
 * Thống kê tổng số bác sĩ
 */
export async function getDoctorTotals(params?: {
  specialtyId?: number;
  isActive?: boolean;
}): Promise<DoctorTotalResponse> {
  const searchParams = new URLSearchParams();

  if (params?.specialtyId)
    searchParams.append("specialtyId", params.specialtyId.toString());
  if (params?.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  const url = `/api/v1/dashboard/doctors${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const res = await authHttp.get<DoctorTotalResponse>(url);
  return res.data;
}

/**
 * Thống kê tổng số bệnh nhân
 */
export async function getPatientTotals(params?: {
  from?: string; // yyyy-MM-dd
  to?: string; // yyyy-MM-dd
}): Promise<PatientTotalResponse> {
  const searchParams = new URLSearchParams();

  if (params?.from) searchParams.append("from", params.from);
  if (params?.to) searchParams.append("to", params.to);

  const url = `/api/v1/dashboard/patients${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const res = await authHttp.get<PatientTotalResponse>(url);
  return res.data;
}

/* ====== NEW: Gọi doanh thu theo tháng ====== */
export async function getMonthlySales(params?: {
  year?: number;
  doctorId?: number;
  serviceId?: number;
}): Promise<MonthlySalesResponse> {
  const sp = new URLSearchParams();
  if (params?.year) sp.append("year", String(params.year));
  if (params?.doctorId) sp.append("doctorId", String(params.doctorId));
  if (params?.serviceId) sp.append("serviceId", String(params.serviceId));

  const url = `/api/v1/dashboard/monthly-sales${
    sp.toString() ? `?${sp.toString()}` : ""
  }`;
  const { data: rawAny } = await authHttp.get<RawMonthlySalesResponse>(url);
  const raw = rawAny ?? {};

  const monthlyRaw = raw.monthly ?? raw.Monthly ?? [];
  const parseNumber = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const cleaned = v.replace(/[^0-9.-]+/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const monthly: MonthlySalePoint[] = monthlyRaw.map((m: RawMonthlyItem) => {
    // normalize month into 1..12
    let mm = m.month ?? m.Month ?? 0;
    mm = Number(mm) || 0;
    if (mm < 1 || mm > 12) mm = 0;
    const monthName =
      m.monthName ?? m.MonthName ?? (mm ? VN_MONTHS[mm - 1] : "");
    return {
      month: mm,
      monthName,
      revenue: parseNumber(m.revenue ?? m.Revenue),
      visitCount: Math.max(
        0,
        Math.floor(parseNumber(m.visitCount ?? m.VisitCount))
      ),
    } as MonthlySalePoint;
  });

  return {
    success: raw.success ?? raw.Success ?? true,
    year: raw.year ?? raw.Year ?? new Date().getFullYear(),
    totalRevenue: raw.totalRevenue ?? raw.TotalRevenue ?? 0,
    currentMonthRevenue:
      raw.currentMonthRevenue ?? raw.CurrentMonthRevenue ?? 0,
    monthOverMonthChange:
      raw.monthOverMonthChange ?? raw.MonthOverMonthChange ?? 0,
    avgMonthlyRevenue: raw.avgMonthlyRevenue ?? raw.AvgMonthlyRevenue ?? 0,
    monthly,
  };
}

export async function getMonthlyTarget(params?: {
  year?: number;
  month?: number;
  doctorId?: number;
  serviceId?: number;
  target?: number; // optional override
}): Promise<MonthlyTargetResponse> {
  const sp = new URLSearchParams();
  if (params?.year) sp.append("year", params.year.toString());
  if (params?.month) sp.append("month", params.month.toString());
  if (params?.doctorId) sp.append("doctorId", params.doctorId.toString());
  if (params?.serviceId) sp.append("serviceId", params.serviceId.toString());
  if (params?.target) sp.append("target", params.target.toString());

  const url = `/api/v1/dashboard/monthly-target${
    sp.toString() ? `?${sp.toString()}` : ""
  }`;
  const res = await authHttp.get<MonthlyTargetResponse>(url);
  return res.data;
}

/**
 * Lấy tổng quan về kho thuốc
 */
export async function getPharmacySummary(params?: {
  expiryDays?: number; // Số ngày để coi là "sắp hết hạn" (mặc định 30)
  lowStockThreshold?: number; // Ngưỡng tồn kho thấp (ví dụ: 20)
}): Promise<PharmacySummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.expiryDays)
    searchParams.append("expiryDays", params.expiryDays.toString());
  if (params?.lowStockThreshold !== undefined)
    searchParams.append(
      "lowStockThreshold",
      params.lowStockThreshold.toString()
    );

  const url = `/api/v1/dashboard/pharmacy-summary${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const res = await authHttp.get<RawPharmacySummaryResponse>(url);
  const raw = res.data ?? {};

  return {
    success: raw.success ?? true,
    totalActiveMedicines: parseNumber(raw.totalActiveMedicines),
    totalStockValue: parseNumber(raw.totalStockValue),
    lowStockItemsCount: parseNumber(raw.lowStockItemsCount),
    expiringSoonCount: parseNumber(raw.expiringSoonCount),
    lowStockItems: (raw.lowStockItems ?? []).map((x) => ({
      medicineId: Math.floor(parseNumber(x.medicineId)),
      name: x.name ?? "",
      totalQuantity: parseNumber(x.totalQuantity),
      unit: x.unit ?? "",
    })),
    expiringLots: (raw.expiringLots ?? []).map((x) => {
      const expiryDate = x.expiryDate ?? "";
      const parsed = parseDateLoose(expiryDate);
      const days =
        x.daysUntilExpiry !== undefined
          ? Math.max(0, Math.floor(parseNumber(x.daysUntilExpiry)))
          : parsed
          ? daysUntil(parsed)
          : 0;

      return {
        lotId: x.lotId,
        medicineName: x.medicineName ?? "",
        lotNumber: x.lotNumber ?? "",
        expiryDate,
        quantity: parseNumber(x.quantity),
        daysUntilExpiry: days,
      };
    }),
  };
}
