// ================== BASIC TYPES ==================
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

// ============ LIST/ADMIN/DETAIL ============
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

// ============ PAYLOADS ============
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
  // CHÚ Ý: không có avatar tại đây (upload URL-only qua update)
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

  // URL-only (giống Service). CHỈ gửi khi thực sự đổi:
  avatarUrl?: string;

  // ĐỂ OPTIONAL để không xoá nhầm khi không gửi
  educations?: DoctorEducation[];
  expertises?: DoctorExpertise[];
  achievements?: DoctorAchievement[];
}

// ============ PAGING & RATING ============
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

// Specialty
export interface Specialty {
  specialtyId: number;
  name: string;
  code: string | null;
}

// Related
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
export interface RelatedDoctorsResponse {
  success: boolean;
  data: RelatedDoctorDto[];
}
