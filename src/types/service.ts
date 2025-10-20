// src/types/service.ts

export type ServiceID = number;
export type ServiceStatus = "active" | "inactive";

export interface ServiceCategoryLite {
  categoryId: number;
  name: string;
  imageUrl?: string | null;
}

export interface ServiceItem {
  serviceId: ServiceID;
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice?: number | null;
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

/** Payload tạo/sửa dịch vụ cho admin */
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

/** Kết quả phân trang chung của BE */
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

/** Helper: map boolean -> union nếu UI cần */
export const toServiceStatus = (isActive: boolean): ServiceStatus =>
  isActive ? "active" : "inactive";
