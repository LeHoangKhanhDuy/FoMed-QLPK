import { authHttp } from "./http";

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
  const monthly: MonthlySalePoint[] = monthlyRaw.map((m: RawMonthlyItem) => ({
    month: m.month ?? m.Month ?? 0,
    monthName: m.monthName ?? m.MonthName ?? "",
    revenue: m.revenue ?? m.Revenue ?? 0,
    visitCount: m.visitCount ?? m.VisitCount ?? 0,
  }));

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
