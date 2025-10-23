export type ServiceID = number;
export type ServiceStatus = "active" | "inactive";

// Dịch vụ có thể có ảnh và có thể có hoặc không có category
export interface ServiceCategoryLite {
  categoryId: number;
  name: string;
  imageUrl?: string | null; // ảnh của category, có thể null hoặc undefined
}

export interface ServiceItem {
  serviceId: number;
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice: number | null;
  durationMin?: number | null;
  isActive: boolean;
  imageUrl?: string | null; // ảnh của dịch vụ, có thể null hoặc undefined
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
  data: ServiceItem[]; // Danh sách dịch vụ
}

export type CreateServicePayload = {
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice: number | null; 
  durationMin?: number | null;
  categoryId: number | null;
  isActive: boolean;
  imageUrl?: string | null;
};

export type UpdateServicePayload = Partial<CreateServicePayload>; // Cập nhật dịch vụ với một số trường có thể thiếu

export interface PagedResult<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[]; // Danh sách các item
    total: number; // Tổng số item
    page: number; // Trang hiện tại
    pageSize: number; // Kích thước mỗi trang
  };
}

// Hàm chuyển trạng thái boolean thành ServiceStatus
export const toServiceStatus = (isActive: boolean): ServiceStatus =>
  isActive ? "active" : "inactive";
