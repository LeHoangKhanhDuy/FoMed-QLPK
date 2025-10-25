import { publicHttp } from "./http";
import { getErrorMessage } from "../Utils/errorHepler";

// Types cho Encounter/Medical Record từ API lookup
export type LookupEncounter = {
  encounterId: number;
  encounterCode: string;
  encounterDate: string;
  chiefComplaint?: string;
  diagnosis?: string;
  doctorName?: string;
  specialtyName?: string;
  status: string;
  totalAmount?: number;
  patientName?: string;
  patientPhone?: string;
};

// Response khi tra cứu theo mã hồ sơ
export type LookupByCodeResponse = {
  success: boolean;
  message?: string;
  data: LookupEncounter;
};

// Response khi tra cứu theo số điện thoại
export type LookupByPhoneResponse = {
  success: boolean;
  message?: string;
  data: {
    items: LookupEncounter[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

/**
 * Tra cứu chi tiết hồ sơ theo mã (HSFM-xxxxxx)
 * @param code - Mã hồ sơ (ví dụ: "HSFM-000123")
 */
export async function apiLookupResultByCode(code: string) {
  try {
    const { data } = await publicHttp.post<LookupByCodeResponse>(
      "/api/v1/lookup-result/by-code",
      { code }
    );
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể tra cứu thông tin hồ sơ"));
  }
}

/**
 * Tra cứu danh sách hồ sơ theo số điện thoại
 * @param phone - Số điện thoại (ví dụ: "0855565715")
 * @param page - Số trang (mặc định 0)
 * @param limit - Số bản ghi trên trang (mặc định 10)
 */
export async function apiLookupResultByPhone(
  phone: string,
  page: number = 0,
  limit: number = 10
) {
  try {
    const { data } = await publicHttp.post<LookupByPhoneResponse>(
      "/api/v1/lookup-result/by-phone",
      { phone, page, limit }
    );
    return data.data;
  } catch (e) {
    throw new Error(
      getErrorMessage(e, "Không thể tra cứu danh sách hồ sơ theo số điện thoại")
    );
  }
}

