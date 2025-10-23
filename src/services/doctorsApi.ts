// src/services/doctorsApi.ts
import { authHttp } from "../services/http";

export type BEDoctor = {
  doctorId: number;
  fullName: string; // "BS. Nguyễn Văn A" (theo swagger bạn gửi)
  title?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
};

export async function apiListDoctors(params?: {
  page?: number;
  limit?: number;
  specialtyId?: number;
  isActive?: boolean;
}) {
  const { data } = await authHttp.get<{
    success: boolean;
    data: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      items: BEDoctor[];
    };
  }>("/api/v1/doctors", { params });

  return data.data;
}
