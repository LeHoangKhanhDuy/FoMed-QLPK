// src/services/encountersApi.ts
import { authHttp } from "./http";

// ==================== INTERFACES ====================

export interface EncounterListItem {
  code: string;
  visitAt: string; // ISO 8601 date string from backend
  doctorName: string;
  serviceName: string;
  status: string;
}

export interface EncountersListResponse {
  patientId: number;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: EncounterListItem[];
}

export interface Encounter {
  encounterId?: number;
  encounterCode: string;
  encounterDate: string;
  doctorName: string;
  serviceName: string;
  status: string;
}

export interface EncounterDetailDrug {
  medicineName: string;
  strength?: string | null;
  form?: string | null;
  dose?: string | null;
  duration?: string | null;
  quantity: number;
  instruction?: string | null;
}

export interface EncounterDetail {
  encounterCode: string;
  visitAt: string; // ISO 8601 date string
  prescriptionCode: string;
  expiryAt?: string | null; // ISO 8601 date string
  erxCode?: string | null;
  erxStatus?: string | null;
  doctorName: string;
  licenseNo?: string | null;
  serviceName?: string | null;
  specialtyName?: string | null;
  patientFullName: string;
  patientCode?: string | null;
  patientDob?: string | null; // DateOnly as string "YYYY-MM-DD"
  patientGender?: string | null; // "Nam" or "Nữ"
  diagnosis?: string | null;
  allergy?: string | null;
  advice?: string | null;
  warning?: string | null;
  items: EncounterDetailDrug[];
}

// ==================== API FUNCTIONS ====================

/**
 * Lấy lịch sử khám bệnh (encounters) theo bệnh nhân
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

  const backendData = data.data;

  return {
    items: (backendData.items ?? []).map((item) => ({
      encounterCode: item.code ?? "",
      encounterDate: item.visitAt,
      doctorName: item.doctorName,
      serviceName: item.serviceName ?? "",
      status: item.status,
    })),
    total: backendData.totalItems,
    page: backendData.page,
    totalPages: backendData.totalPages,
  };
}

/**
 * Lấy chi tiết encounter (theo ID hoặc Code)
 */
export async function apiGetEncounterDetail(
  codeOrId: string | number
): Promise<EncounterDetail> {
  let normalized = codeOrId;

  if (typeof codeOrId === "string") {
    const aliasMatch = /^HSFM-(\d+)$/.exec(codeOrId.trim().toUpperCase());
    if (aliasMatch) {
      normalized = Number(aliasMatch[1]);
    }
  }

  console.log("🔍 Fetching encounter detail for:", codeOrId);
  console.log("📍 URL:", `/api/v1/encounters/details/${normalized}`);

  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message: string;
      data: EncounterDetail;
    }>(`/api/v1/encounters/details/${normalized}`);

    console.log("✅ Encounter detail fetched successfully:", data.data);
    return data.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch encounter detail:");
    console.error("  - CodeOrId:", codeOrId);
    console.error("  - Status:", error?.response?.status);
    console.error("  - Message:", error?.response?.data?.message);
    console.error("  - Full error:", error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format status từ backend sang text hiển thị
 */
export function formatEncounterStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: "Đang chờ",
    PENDING: "Đang chờ",
    FINALIZED: "Đã khám",
    COMPLETED: "Đã khám",
    FINISHED: "Đã khám",
    DONE: "Đã khám",
    CANCELLED: "Đã hủy",
    CANCELED: "Đã hủy",
    IN_PROGRESS: "Đang khám",
    PROCESSING: "Đang khám",
    CONFIRMED: "Đã xác nhận",
  };

  return statusMap[status?.toUpperCase()] || status || "Không xác định";
}

/**
 * Format ISO date string to Vietnamese locale
 * Input: "2025-08-01T10:30:00" or "2025-08-01T10:30:00.000Z"
 * Output: "01/08/2025 10:30"
 */
export function formatVietnameseDate(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format DateOnly string (YYYY-MM-DD) to Vietnamese date
 * Input: "1995-04-12"
 * Output: "12/04/1995"
 */
export function formatVietnameseDateOnly(dateString: string): string {
  if (!dateString) return "";

  try {
    // DateOnly từ backend có format "YYYY-MM-DD"
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Parse gender từ backend ("Nam"/"Nữ") sang sex code ("M"/"F")
 */
export function parseGenderToSex(
  gender?: string | null
): "M" | "F" | undefined {
  if (!gender) return undefined;
  if (gender === "Nam") return "M";
  if (gender === "Nữ") return "F";
}
