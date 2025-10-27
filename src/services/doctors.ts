// src/services/doctors.ts
// File tổng hợp export tất cả doctor-related APIs và types

// Export tất cả types
export type {
  DoctorEducation,
  DoctorExpertise,
  DoctorAchievement,
  DoctorWeeklySlot,
  DoctorListItem,
  DoctorItem,
  DoctorDetail,
  AvailableUser,
  CreateDoctorPayload,
  UpdateDoctorPayload,
  DoctorsListResponse,
  DoctorsPublicListResponse,
  DoctorRating,
  DoctorRatingsResponse,
  Specialty,
} from "./doctorMApi";

// Export tất cả functions
export {
  apiGetDoctors,
  apiGetAvailableUsers,
  apiCreateDoctor,
  apiUpdateDoctor,
  apiDeactivateDoctor,
  apiActivateDoctor,
  apiGetSpecialties,
  apiGetDoctorDetail,
  apiGetPublicDoctors,
  apiGetDoctorRatings,
} from "./doctorMApi";

// Backward compatibility - export cả API cũ
export { apiListDoctors, apiGetDoctorById, type BEDoctor } from "./doctorsApi";

