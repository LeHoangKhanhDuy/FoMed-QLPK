// src/services/encountersApi.ts
import { authHttp } from "./http";

// Interface theo đúng backend response
export interface EncounterListItem {
  Code: string;           // Backend: "HSFM-123"
  VisitAt: string;        // Backend: ISO date
  DoctorName: string;
  ServiceName: string;
  Status: string;
}

export interface EncountersListResponse {
  patientId: number;
  page: number;
  limit: number;
  totalItems: number;     // ← Backend dùng "totalItems", không phải "total"
  totalPages: number;
  items: EncounterListItem[];
}

// Interface để dùng trong frontend (đã normalize)
export interface Encounter {
  encounterId?: number;
  encounterCode: string;
  encounterDate: string;
  doctorName: string;
  serviceName: string | null;
  status: string;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
}

/**
 * Lấy lịch sử khám bệnh (encounters) theo bệnh nhân
 * PATIENT: chỉ xem của mình
 * ADMIN/DOCTOR: có thể xem qua patientId/patientCode
 */
export async function apiGetEncounters(params?: {
  patientId?: number;
  patientCode?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: Encounter[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { data } = await authHttp.get<{
    success: boolean;
    message: string;
    data: EncountersListResponse;
  }>("/api/v1/encounters", { params });

  // Map backend response sang frontend format
  const backendData = data.data;
  
  return {
    items: backendData.items.map((item) => ({
      encounterCode: item.Code,
      encounterDate: item.VisitAt,
      doctorName: item.DoctorName,
      serviceName: item.ServiceName || null,
      status: item.Status,
      chiefComplaint: null,
      diagnosis: null,
    })),
    total: backendData.totalItems, // ← Map "totalItems" thành "total"
    page: backendData.page,
    totalPages: backendData.totalPages,
  };
}

/**
 * Lấy chi tiết encounter (theo ID hoặc Code)
 */
export async function apiGetEncounterDetail(
  codeOrId: string | number
): Promise<unknown> {
  const { data } = await authHttp.get<{
    success: boolean;
    message: string;
    data: unknown;
  }>(`/api/v1/encounters/details/${codeOrId}`);

  return data.data;
}

