

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
}

export interface DoctorsListResponse {
  items: DoctorItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Specialty {
  specialtyId: number;
  name: string;
  code: string | null;
}

const API_BASE = "/api/v1/doctors";

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
): Promise<DoctorItem> {
  const res = await fetch(`${API_BASE}/details/${doctorId}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải thông tin bác sĩ");
  }

  const json = await res.json();
  return json.data as DoctorItem; // ép kiểu an toàn
}

/**
 * Lấy danh sách bác sĩ công khai (không cần auth)
 */
export async function apiGetPublicDoctors(params: {
  page?: number;
  limit?: number;
}): Promise<DoctorsListResponse> {
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
  return json.data;
}

/**
 * Lấy đánh giá của bác sĩ
 */
export async function apiGetDoctorRatings(
  doctorId: number,
  params: { page?: number; limit?: number }
): Promise<{
  items: unknown[];
  total: number;
  page: number;
  totalPages: number;
}> {
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
  return json.data;
}
