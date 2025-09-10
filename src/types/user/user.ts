export type UserID = number;

export type UserRole = "patient" | "staff" | "doctor" | "admin";
export type UserStatus = "active" | "inactive";

export interface User {
  id: UserID;
  code: string; // mã hồ sơ/nhân sự
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO
}
