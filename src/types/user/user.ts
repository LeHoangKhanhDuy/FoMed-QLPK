// src/types/user/user.ts
export type AdminRole = "ADMIN" | "DOCTOR" | "EMPLOYEE" | "PATIENT";
export type UserStatus = "active" | "inactive";

export type User = {
  id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  roles: AdminRole[];
  status: UserStatus; // map từ IsActive
  createdAt: string | null;
};
