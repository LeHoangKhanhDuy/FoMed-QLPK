import { authHttp } from "./http";
import { getErrorMessage } from "../Utils/errorHepler";

// Types
interface ApiPrescriptionItem {
  medicineName: string;
  dose: string;
  duration: string;
  quantity: number;
}

interface ApiPrescriptionDetailData {
  code: string;
  prescribedAt: string;
  doctorName: string;
  diagnosis: string;
  items: ApiPrescriptionItem[];
  advice?: string;
}

export interface PrescriptionDetailData {
  code: string;
  prescribedAt: string;
  doctorName: string;
  diagnosis: string;
  items: ApiPrescriptionItem[];
  advice?: string;
}

interface ApiPrescriptionDetailResponse {
  success: boolean;
  message?: string;
  data: ApiPrescriptionDetailData;
}

// API Functions
export interface PrescriptionSummary {
  code: string;
  prescribedAt: string;
  doctorName: string;
  diagnosis: string;
}

export interface PrescriptionPage {
  patientId: number;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: PrescriptionSummary[];
}

interface PrescriptionResponse {
  success: boolean;
  message?: string;
  data: PrescriptionPage;
}

export async function apiGetPrescriptions(options: {
  patientId: number;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<PrescriptionPage> {
  const { patientId, page = 1, limit = 20, signal } = options;

  try {
    const { data } = await authHttp.get<PrescriptionResponse>(
      "/api/v1/prescriptions",
      {
        params: { patientId, page, limit },
        signal,
      }
    );

    if (!data.success) {
      throw new Error(data.message || "Không thể tải đơn thuốc");
    }

    return data.data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Không thể tải danh sách đơn thuốc")
    );
  }
}

export async function apiGetPrescriptionDetail(
  rxCode: string,
  signal?: AbortSignal
): Promise<PrescriptionDetailData> {
  try {
    const { data } = await authHttp.get<ApiPrescriptionDetailResponse>(
      `/api/v1/prescriptions/details/${encodeURIComponent(rxCode)}`,
      { signal }
    );

    if (!data.success) {
      throw new Error(data.message || "Không thể tải chi tiết đơn thuốc");
    }

    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Không thể tải chi tiết đơn thuốc"));
  }
}
