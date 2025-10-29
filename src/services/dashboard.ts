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
  if (params?.doctorId) searchParams.append("doctorId", params.doctorId.toString());
  if (params?.serviceId) searchParams.append("serviceId", params.serviceId.toString());

  const url = `/api/v1/dashboard/visits${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
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
  
  if (params?.specialtyId) searchParams.append("specialtyId", params.specialtyId.toString());
  if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString());

  const url = `/api/v1/dashboard/doctors${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
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

  const url = `/api/v1/dashboard/patients${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const res = await authHttp.get<PatientTotalResponse>(url);
  return res.data;
}

