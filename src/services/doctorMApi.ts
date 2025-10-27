// Types cho Education, Expertise, Achievement
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

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "")}/api/v1/doctors`;

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  };
}

/**
 * Lấy danh sách bác sĩ (Admin)
 */
export async function apiGetDoctors(params: {
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}): Promise<DoctorsListResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  if (params.search) {
    query.set("search", params.search);
  }

  const res = await fetch(`${API_BASE}/admin/list?${query}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách bác sĩ");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Lấy danh sách Users có role DOCTOR chưa có hồ sơ
 */
export async function apiGetAvailableUsers(): Promise<AvailableUser[]> {
  const res = await fetch(`${API_BASE}/admin/available-users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách users");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Tạo hồ sơ bác sĩ mới
 */
export async function apiCreateDoctor(
  payload: CreateDoctorPayload
): Promise<{ doctorId: number }> {
  const res = await fetch(`${API_BASE}/admin/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tạo hồ sơ bác sĩ");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Cập nhật hồ sơ bác sĩ
 */
export async function apiUpdateDoctor(
  doctorId: number,
  payload: UpdateDoctorPayload
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể cập nhật hồ sơ bác sĩ");
  }
}

/**
 * Vô hiệu hóa bác sĩ
 */
export async function apiDeactivateDoctor(doctorId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể vô hiệu hóa bác sĩ");
  }
}

/**
 * Kích hoạt lại bác sĩ
 */
export async function apiActivateDoctor(doctorId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}/activate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể kích hoạt bác sĩ");
  }
}

/**
 * Lấy danh sách chuyên khoa
 */
export async function apiGetSpecialties(): Promise<Specialty[]> {
  const res = await fetch("/api/v1/specialties", {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách chuyên khoa");
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Lấy chi tiết bác sĩ công khai
 */
export async function apiGetDoctorDetail(
  doctorId: number
): Promise<DoctorDetail> {
  const res = await fetch(`${API_BASE}/details/${doctorId}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải thông tin bác sĩ");
  }

  const json = await res.json();
  return json.data as DoctorDetail;
}

/**
 * Lấy danh sách bác sĩ công khai (không cần auth)
 */
export async function apiGetPublicDoctors(params: {
  page?: number;
  limit?: number;
}): Promise<DoctorsPublicListResponse> {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  });

  const res = await fetch(`${API_BASE}?${query}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách bác sĩ");
  }

  const json = await res.json();
  return json.data as DoctorsPublicListResponse;
}

/**
 * Lấy đánh giá của bác sĩ
 */
export async function apiGetDoctorRatings(
  doctorId: number,
  params: { page?: number; limit?: number }
): Promise<DoctorRatingsResponse> {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  });

  const res = await fetch(`${API_BASE}/ratings/${doctorId}?${query}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách đánh giá");
  }

  const json = await res.json();
  return json.data as DoctorRatingsResponse;
}

/**
 * Upload ảnh đại diện cho bác sĩ
 * @param doctorId - ID của bác sĩ
 * @param file - File ảnh cần upload
 * @returns URL của ảnh đã upload
 */
export async function apiUploadDoctorAvatar(
  doctorId: number,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); // Backend nhận field name là "file"

  const res = await fetch(`${API_BASE}/admin/${doctorId}/upload-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể upload ảnh đại diện");
  }

  const json = await res.json();
  
  // Backend response: { success, message, data: { doctorId, avatarUrl } }
  if (!json.success) {
    throw new Error(json.message || "Upload thất bại");
  }
  
  return json.data?.avatarUrl || "";
}

/**
 * Xóa ảnh đại diện của bác sĩ (trở về ảnh profile)
 * @param doctorId - ID của bác sĩ
 * @returns URL ảnh fallback (từ profile)
 */
export async function apiDeleteDoctorAvatar(
  doctorId: number
): Promise<string> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}/delete-avatar`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể xóa ảnh đại diện");
  }

  const json = await res.json();
  
  if (!json.success) {
    throw new Error(json.message || "Xóa ảnh thất bại");
  }
  
  // Trả về URL của ảnh fallback (profile avatar)
  return json.data?.avatarUrl || "";
}