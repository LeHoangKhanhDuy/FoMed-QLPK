export type ServiceID = number;
export type ServiceStatus = "active" | "inactive";

export interface ServiceCategoryLite {
  categoryId: number;
  name: string;
  imageUrl?: string | null;
}

export interface ServiceItem {
  serviceId: number;
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice: number | null;
  durationMin?: number | null;
  isActive: boolean;
  imageUrl?: string | null;
  category?: ServiceCategoryLite | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicesListResponse {
  success: boolean;
  message?: string;
  total: number;
  page: number;
  pageSize: number;
  data: ServiceItem[];
}

export interface CreateServicePayload {
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice?: number | null;
  durationMin?: number | null;
  categoryId?: number | null;
  isActive?: boolean;
}
export type UpdateServicePayload = Partial<CreateServicePayload>;

export interface PagedResult<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const toServiceStatus = (isActive: boolean): ServiceStatus =>
  isActive ? "active" : "inactive";
