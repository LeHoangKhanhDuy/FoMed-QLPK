import { publicHttp } from "./http";
import { getErrorMessage } from "../Utils/errorHepler";
import type { SpecialtyItem } from "../types/specialty/specialtyType";

const PREFIX = "/api/v1/specialties";

type PublicSpecialtyResponse = {
  success: boolean;
  message?: string;
  data: SpecialtyItem[];
};

/**
 * Lấy danh sách chuyên khoa public (mặc định chỉ lấy chuyên khoa đang active)
 */
export async function getPublicSpecialties(options?: {
  isActive?: boolean;
}): Promise<SpecialtyItem[]> {
  try {
    const params = {
      isActive: options?.isActive ?? true,
    };
    const { data } = await publicHttp.get<PublicSpecialtyResponse>(PREFIX, {
      params,
    });
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể tải danh sách chuyên khoa")
    );
  }
}
