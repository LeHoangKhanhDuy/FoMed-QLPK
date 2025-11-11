import { authHttp } from "../services/http";
import { getErrorMessage } from "../Utils/errorHepler";

export type PatientListItem = {
  patientId: number;
  patientCode?: string | null;
  fullName: string;
  gender?: "M" | "F" | "O" | "" | null;
  dateOfBirth?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  identityNo?: string | null;
  isActive: boolean;
  createdAt: string;
  
};

export type PatientDetail = {
  patientId: number;
  patientCode?: string | null;
  fullName: string;
  gender?: "M" | "F" | "O" | "" | null;
  dateOfBirth?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  identityNo?: string | null;
  insuranceNo?: string | null;
  note?: string | null;
  allergyText?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type PatientPayload = {
  fullName: string;
  phone: string;
  gender?: "M" | "F" | "O" | "";
  dateOfBirth?: string | null;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  identityNo?: string | null;
  insuranceNo?: string | null;
  note?: string | null;
  allergyText?: string | null;
  patientCode?: string | null;
};

type ListResponse = {
  success: boolean;
  message?: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    items: PatientListItem[];
  };
};

export async function apiListPatients(params?: {
  query?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const { data } = await authHttp.get<ListResponse>(
      "/api/v1/admin/patients",
      { params }
    );
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể tải danh sách bệnh nhân"));
  }
}

export async function apiGetPatient(id: number) {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      data: PatientDetail;
    }>(`/api/v1/admin/patients/${id}`);
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lấy thông tin bệnh nhân"));
  }
}

export async function apiCreatePatient(payload: PatientPayload) {
  try {
    const { data } = await authHttp.post<{
      success: boolean;
      data: { patientId: number };
    }>("/api/v1/admin/patients/create", payload);
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể tạo bệnh nhân"));
  }
}

export async function apiUpdatePatient(id: number, payload: PatientPayload) {
  try {
    await authHttp.put(`/api/v1/admin/patients/update/${id}`, payload);
  } catch (e) {
    throw new Error(
      getErrorMessage(e, "Không thể cập nhật thông tin bệnh nhân")
    );
  }
}

export async function apiTogglePatient(id: number, isActive: boolean) {
  try {
    await authHttp.patch(`/api/v1/admin/patients/status/${id}`, { isActive });
  } catch (e) {
    throw new Error(
      getErrorMessage(e, "Không thể cập nhật trạng thái bệnh nhân")
    );
  }
}

export async function apiDeletePatient(id: number) {
  try {
    await authHttp.delete(`/api/v1/admin/patients/delete/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể xoá (ẩn) bệnh nhân"));
  }
}

// Tạo hoặc lấy bệnh nhân theo SĐT
export async function apiUpsertPatientByPhone(payload: PatientPayload) {
  try {
    const { data } = await authHttp.post<{
      success: boolean;
      message: string;
      data: { patientId: number; isNew: boolean };
    }>("/api/v1/admin/patients/upsert-by-phone", payload);
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể tạo/lấy bệnh nhân"));
  }
}

export async function apiGetMyPatientId() {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message?: string;
      data: {
        patientId: number;
        fullName: string;
        phone: string;
        isNew: boolean;
      };
    }>("/api/v1/user/my-patient-id");

    if (!data.success) {
      throw new Error(data.message || "Không thể lấy thông tin bệnh nhân");
    }

    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lấy thông tin bệnh nhân"));
  }
}
