

export interface SpecialtyItem {
  specialtyId: number;
  code: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  doctorCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyPayload {
  name: string;
  code?: string | null;
  description?: string | null;
}

export interface UpdateSpecialtyPayload {
  name?: string | null;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface SpecialtiesListResponse {
  items: SpecialtyItem[];
  total: number;
  page: number;
  totalPages: number;
}
