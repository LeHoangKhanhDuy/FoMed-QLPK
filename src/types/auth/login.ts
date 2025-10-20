export interface AppUser {
  userId: number;
  email: string;
  name: string;
  phone: string;
  createdAt?: string;
  avatarUrl?: string | null;
  roles: Array<"ADMIN" | "DOCTOR" | "EMPLOYEE" | "USER">;
}

export interface LoginNormalized {
  status: boolean;
  status_code?: number;
  message?: string;
  token?: string;
  refreshToken?: string;
  user: AppUser;
}
