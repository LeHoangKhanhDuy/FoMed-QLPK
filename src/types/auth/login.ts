export interface AppUser {
  userId: number;
  email: string;
  name: string;
  phone: string;
  roles: string[];
  createdAt?: string;
  avatarUrl?: string | null;
  points?: number;
}

export interface LoginNormalized {
  status: boolean;
  status_code?: number;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: AppUser;
}
