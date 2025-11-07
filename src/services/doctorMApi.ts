import type {
  AvailableUser,
  CreateDoctorPayload,
  DoctorDetail,
  DoctorsListResponse,
  DoctorsPublicListResponse,
  DoctorRatingsResponse,
  RelatedDoctorDto,
  RelatedDoctorsResponse,
  Specialty,
  UpdateDoctorPayload,
} from "../types/doctor/doctor";

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  ""
)}/api/v1/doctors`;

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  };
}

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
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));
  if (params.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE}/admin/list?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải danh sách bác sĩ"
    );
  const json = await res.json();
  return json.data;
}

export async function apiGetAvailableUsers(): Promise<AvailableUser[]> {
  const res = await fetch(`${API_BASE}/admin/available-users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải danh sách users"
    );
  const json = await res.json();
  return json.data;
}

export async function apiCreateDoctor(
  payload: CreateDoctorPayload
): Promise<{ doctorId: number }> {
  const res = await fetch(`${API_BASE}/admin/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tạo hồ sơ bác sĩ"
    );
  const json = await res.json();
  return json.data;
}

export async function apiUpdateDoctor(
  doctorId: number,
  payload: Partial<UpdateDoctorPayload>
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể cập nhật hồ sơ bác sĩ"
    );
}

export async function apiDeactivateDoctor(doctorId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể vô hiệu hóa bác sĩ"
    );
}

export async function apiActivateDoctor(doctorId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}/activate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể kích hoạt bác sĩ"
    );
}

export async function apiGetSpecialties(): Promise<Specialty[]> {
  const res = await fetch("/api/v1/specialties", { headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải danh sách chuyên khoa"
    );
  const json = await res.json();
  return json.data || [];
}

export async function apiGetDoctorDetail(
  doctorId: number
): Promise<DoctorDetail> {
  const res = await fetch(`${API_BASE}/details/${doctorId}`);
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải thông tin bác sĩ"
    );
  const json = await res.json();
  return json.data as DoctorDetail;
}

export async function apiGetPublicDoctors(params: {
  page?: number;
  limit?: number;
}): Promise<DoctorsPublicListResponse> {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  });
  const res = await fetch(`${API_BASE}?${query}`);
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải danh sách bác sĩ"
    );
  const json = await res.json();
  return json.data as DoctorsPublicListResponse;
}

export async function apiGetDoctorRatings(
  doctorId: number,
  params: { page?: number; limit?: number }
): Promise<DoctorRatingsResponse> {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  });
  const res = await fetch(`${API_BASE}/ratings/${doctorId}?${query}`);
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải danh sách đánh giá"
    );
  const json = await res.json();
  return json.data as DoctorRatingsResponse;
}

// Upload avatar qua BE (nếu vẫn dùng). Nếu chuyển URL-only hoàn toàn, có thể bỏ.
export async function apiUploadDoctorAvatar(
  doctorId: number,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/admin/${doctorId}/upload-avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    body: formData,
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể upload ảnh đại diện"
    );
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Upload thất bại");
  return json.data?.avatarUrl || "";
}

export async function apiDeleteDoctorAvatar(doctorId: number): Promise<string> {
  const res = await fetch(`${API_BASE}/admin/${doctorId}/delete-avatar`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể xóa ảnh đại diện"
    );
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Xóa ảnh thất bại");
  return json.data?.avatarUrl || "";
}

// Related
export async function apiGetRelatedDoctors(
  doctorId: number,
  limit: number = 10
): Promise<RelatedDoctorDto[]> {
  const res = await fetch(`${API_BASE}/related/${doctorId}?limit=${limit}`);
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).message ||
        "Không thể tải danh sách bác sĩ liên quan"
    );
  const json: RelatedDoctorsResponse = await res.json();
  if (!json.success)
    throw new Error("Không thể tải danh sách bác sĩ liên quan");
  return json.data || [];
}
