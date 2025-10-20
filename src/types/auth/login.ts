export interface AppUser {
  userId: number;
  email: string;
  name: string;
  phone: string;
  roles: string[];
  createdAt?: string;
  avatarUrl?: string | null;
}

export interface LoginNormalized {
  status: boolean;
  status_code?: number;
  message?: string;
  token?: string;
  refreshToken?: string;
  user: AppUser;
}
