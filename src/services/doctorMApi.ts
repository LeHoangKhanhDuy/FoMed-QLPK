import axios from "axios";
import { authHttp, publicHttp } from "./http";
import type { RelatedDoctorsResponse } from "../types/doctor/doctor";

export interface RelatedDoctorDto {
  doctorId: number;
  fullName: string | null;
  title: string | null;
  avatarUrl: string | null;
  primarySpecialtyId: number | null;
  primarySpecialtyName: string | null;
  experienceYears: number | null;
  ratingAvg: number;
  ratingCount: number;
  roomName: string | null;
}

export interface DoctorEducation {
  yearFrom?: number | null;
  yearTo?: number | null;
  title: string;
  detail?: string | null;
}

export interface DoctorExpertise {
  content: string;
}

export interface DoctorAchievement {
  yearLabel?: string | null;
  content: string;
}

export interface DoctorWeeklySlot {
  weekday: number; // 0=CN, 1=T2, ..., 6=T7
  startTime: string; // "08:00"
  endTime: string; // "12:00"
  note?: string | null;
}

// Doctor Item cho danh sách (list)
export interface DoctorListItem {
  doctorId: number;
  fullName: string;
  title: string | null;
  primarySpecialtyName: string | null;
  roomName: string | null;
  experienceYears: number | null;
  ratingAvg: number;
  ratingCount: number;
  avatarUrl: string | null;
  intro?: string | null;
  visitCount?: number;
  educations: DoctorEducation[];
  expertises: DoctorExpertise[];
  achievements: DoctorAchievement[];
}

// Doctor Item cho admin (có thêm thông tin quản trị)
export interface DoctorItem {
  doctorId: number;
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  primarySpecialtyName: string | null;
  licenseNo: string | null;
  roomName: string | null;
  experienceYears: number | null;
  isActive: boolean;
  avatarUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

// Doctor Detail (chi tiết đầy đủ)
export interface DoctorDetail {
  doctorId: number;
  fullName: string;
  title: string | null;
  licenseNo: string | null;
  primarySpecialtyName: string | null;
  roomName: string | null;
  experienceYears: number | null;
  experienceNote: string | null;
  intro: string | null;
  visitCount: number;
  ratingAvg: number;
  ratingCount: number;
  avatarUrl: string | null;
  educations: DoctorEducation[];
  expertises: DoctorExpertise[];
  achievements: DoctorAchievement[];
  weeklySlots: DoctorWeeklySlot[];
}

export interface AvailableUser {
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface CreateDoctorPayload {
  userId: number;
  title?: string | null;
  primarySpecialtyId?: number | null;
  licenseNo?: string | null;
  roomName?: string | null;
  avatarUrl?: string | null;
  experienceYears?: number | null;
  experienceNote?: string | null;
  intro?: string | null;
  educations?: DoctorEducation[];
  expertises?: DoctorExpertise[];
  achievements?: DoctorAchievement[];
}

export interface UpdateDoctorPayload {
  title?: string | null;
  primarySpecialtyId?: number | null;
  licenseNo?: string | null;
  roomName?: string | null;
  avatarUrl?: string | null;
  experienceYears?: number | null;
  experienceNote?: string | null;
  intro?: string | null;
  isActive?: boolean;
  educations: DoctorEducation[];
  expertises: DoctorExpertise[];
  achievements: DoctorAchievement[];
}

export interface DoctorsListResponse {
  items: DoctorItem[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorsPublicListResponse {
  items: DoctorListItem[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorRating {
  ratingId: number;
  score: number;
  comment?: string | null;
  createdAt: string;
}

export interface DoctorRatingsResponse {
  items: DoctorRating[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Specialty {
  specialtyId: number;
  name: string;
  code: string | null;
}

// Upload response types
export interface UploadAvatarResponse {
  avatarUrl: string;
  message?: string;
}

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  Message?: string;
  data: T;
};

const PREFIX = "/api/v1/doctors";

function pickMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const p = payload as { message?: unknown; Message?: unknown };
  return (typeof p.message === "string" && p.message) ||
    (typeof p.Message === "string" && p.Message)
    ? String(p.message ?? p.Message)
    : undefined;
}

function throwAxiosError(e: unknown, fallback: string): never {
  if (axios.isAxiosError(e)) {
    const msg = pickMessage(e.response?.data) || e.message;
    throw new Error(msg || fallback);
  }
  throw new Error(fallback);
}

export async function apiGetDoctors(params: {
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}): Promise<DoctorsListResponse> {
  try {
    const { data } = await authHttp.get<ApiEnvelope<DoctorsListResponse>>(
      `${PREFIX}/admin/list`,
      { params }
    );
    return data.data;
  } catch (e) {
    throwAxiosError(e, "Lỗi tải danh sách bác sĩ");
  }
}

export async function apiGetAvailableUsers(): Promise<AvailableUser[]> {
  try {
    const { data } = await authHttp.get<ApiEnvelope<AvailableUser[]>>(
      `${PREFIX}/admin/available-users`
    );
    return data.data;
  } catch (e) {
    throwAxiosError(e, "Lỗi tải users");
  }
}

export async function apiCreateDoctor(
  payload: CreateDoctorPayload
): Promise<{ doctorId: number }> {
  try {
    const { data } = await authHttp.post<ApiEnvelope<{ doctorId: number }>>(
      `${PREFIX}/admin/create`,
      payload
    );
    return data.data;
  } catch (e) {
    throwAxiosError(e, "Lỗi tạo bác sĩ");
  }
}

export async function apiUpdateDoctor(
  doctorId: number,
  payload: Partial<UpdateDoctorPayload>
): Promise<void> {
  try {
    await authHttp.put(`${PREFIX}/admin/${doctorId}`, payload);
  } catch (e) {
    throwAxiosError(e, "Lỗi cập nhật bác sĩ");
  }
}

export async function apiDeactivateDoctor(doctorId: number): Promise<void> {
  try {
    await authHttp.delete(`${PREFIX}/admin/${doctorId}`);
  } catch (e) {
    throwAxiosError(e, "Lỗi vô hiệu hóa");
  }
}

export async function apiActivateDoctor(doctorId: number): Promise<void> {
  try {
    await authHttp.patch(`${PREFIX}/admin/${doctorId}/activate`);
  } catch (e) {
    throwAxiosError(e, "Lỗi kích hoạt");
  }
}

export async function apiGetSpecialties(): Promise<Specialty[]> {
  try {
    const { data } = await authHttp.get<ApiEnvelope<Specialty[]>>(
      "/api/v1/specialties"
    );
    return data.data || [];
  } catch (e) {
    throwAxiosError(e, "Lỗi tải chuyên khoa");
  }
}

export async function apiGetDoctorDetail(
  doctorId: number
): Promise<DoctorDetail> {
  try {
    const { data } = await publicHttp.get<ApiEnvelope<DoctorDetail>>(
      `${PREFIX}/details/${doctorId}`
    );
    return data.data as DoctorDetail;
  } catch (e) {
    throwAxiosError(e, "Không thể tải thông tin bác sĩ");
  }
}

export async function apiGetPublicDoctors(params: {
  page?: number;
  limit?: number;
}): Promise<DoctorsPublicListResponse> {
  try {
    const { data } = await publicHttp.get<
      ApiEnvelope<DoctorsPublicListResponse>
    >(`${PREFIX}`, {
      params: { page: params.page ?? 1, limit: params.limit ?? 20 },
    });
    return data.data as DoctorsPublicListResponse;
  } catch (e) {
    throwAxiosError(e, "Không thể tải danh sách bác sĩ");
  }
}

export async function apiGetDoctorRatings(
  doctorId: number,
  params: { page?: number; limit?: number }
): Promise<DoctorRatingsResponse> {
  try {
    const { data } = await publicHttp.get<ApiEnvelope<DoctorRatingsResponse>>(
      `${PREFIX}/ratings/${doctorId}`,
      { params: { page: params.page ?? 1, limit: params.limit ?? 20 } }
    );
    return data.data as DoctorRatingsResponse;
  } catch (e) {
    throwAxiosError(e, "Không thể tải danh sách đánh giá");
  }
}

// Upload avatar qua BE (nếu vẫn dùng). Nếu chuyển URL-only hoàn toàn, có thể bỏ.
export async function apiUploadDoctorAvatar(
  doctorId: number,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const { data } = await authHttp.post<ApiEnvelope<{ avatarUrl?: string }>>(
      `${PREFIX}/admin/${doctorId}/upload-avatar`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data.data?.avatarUrl || "";
  } catch (e) {
    throwAxiosError(e, "Không thể upload ảnh đại diện");
  }
}

export async function apiDeleteDoctorAvatar(doctorId: number): Promise<string> {
  try {
    const { data } = await authHttp.delete<ApiEnvelope<{ avatarUrl?: string }>>(
      `${PREFIX}/admin/${doctorId}/delete-avatar`
    );
    return data.data?.avatarUrl || "";
  } catch (e) {
    throwAxiosError(e, "Lỗi xóa ảnh");
  }
}

export async function apiUploadCommonFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); // Key này phải khớp với tham số 'IFormFile file' ở Backend
  try {
    const { data } = await authHttp.post<ApiEnvelope<{ url?: string }>>(
      "/api/v1/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data?.url || "";
  } catch (e) {
    throwAxiosError(e, "Upload ảnh thất bại");
  }
}

// Related
export async function apiGetRelatedDoctors(
  doctorId: number,
  limit: number = 10
): Promise<RelatedDoctorDto[]> {
  try {
    const { data } = await publicHttp.get<RelatedDoctorsResponse>(
      `${PREFIX}/related/${doctorId}`,
      { params: { limit } }
    );
    if (!data.success)
      throw new Error("Không thể tải danh sách bác sĩ liên quan");
    return data.data || [];
  } catch (e) {
    throwAxiosError(e, "Không thể tải danh sách bác sĩ liên quan");
  }
}
