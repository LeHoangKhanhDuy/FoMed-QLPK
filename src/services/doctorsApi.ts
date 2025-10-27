// src/services/doctorsApi.ts
// File này giữ lại cho backward compatibility, nhưng nên dùng doctorMApi.ts mới
import { publicHttp } from "./http";

// Types cơ bản (giữ lại cho backward compatibility)
export type BEDoctor = {
  doctorId: number;
  fullName: string;
  title?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  avatarUrl?: string | null;
  primarySpecialtyName?: string | null;
  roomName?: string | null;
  experienceYears?: number | null;
};

export async function apiListDoctors(params?: {
  page?: number;
  limit?: number;
  specialtyId?: number;
  isActive?: boolean;
}) {
  const { data } = await publicHttp.get<{
    success: boolean;
    data: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      items: BEDoctor[];
    };
  }>("/api/v1/doctors", { params });

  return data.data;
}

export async function apiGetDoctorById(id: number) {
  const { data } = await publicHttp.get<{
    success: boolean;
    message: string;
    data: BEDoctor;
  }>(`/api/v1/doctors/details/${id}`);

  return data.data;
}
