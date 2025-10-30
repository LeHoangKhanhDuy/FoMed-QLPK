import type { AppointmentStatus } from "../types/appointment/appointment";
import { authHttp } from "./http";

/* ====== Types từ BE ====== */
export type BEAppointmentStatus =
  | "waiting"
  | "booked"
  | "done"
  | "cancelled"
  | "no_show";

export type BEAppointment = {
  appointmentId: number;
  code: string;
  status: BEAppointmentStatus;
  queueNo?: number | null;
  createdAt: string;

  visitDate: string; // "yyyy-MM-dd"
  visitTime: string; // "HH:mm:ss"

  patientId: number;
  patientName?: string;
  patientPhone?: string;

  doctorId: number;
  doctorName?: string;

  serviceId?: number | null;
  serviceName?: string | null;
};

type ListData<T> = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
};

type ListResp = {
  success: boolean;
  data: ListData<BEAppointment>;
  message?: string;
};

type CreateReq = {
  patientId: number;
  doctorId: number;
  serviceId?: number;
  visitDate: string; // yyyy-MM-dd
  visitTime: string; // HH:mm:ss
  reason?: string | null;
};

type CreateData = BEAppointment;

type CreateResp = {
  success: boolean;
  data: CreateData;
  message?: string;
};

/* ====== API ====== */

export async function appointmentsList(params: {
  date?: string;
  doctorId?: number;
  page?: number;
  limit?: number;
}): Promise<ListData<BEAppointment>> {
  const { date, doctorId, page = 1, limit = 20 } = params ?? {};

  const res = await authHttp.get<ListResp>("/api/v1/appointments", {
    params: { date, doctorId, page, limit },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Không thể tải danh sách lịch");
  }

  // Return data object chứa page, limit, total, totalPages, items
  return res.data.data;
}

export async function createAppointment(body: CreateReq): Promise<CreateData> {
  try {
    console.log("🚀 Gọi API tạo appointment với body:", body);
    
    const res = await authHttp.post<CreateResp>(
      "/api/v1/appointments/create",
      body
    );

    console.log("✅ Response từ API:", res.data);

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Tạo lịch thất bại");
    }

    return res.data.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi gọi API tạo appointment:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

export async function updateAppointmentStatus(
  appointmentId: number,
  status: AppointmentStatus
) {
  await authHttp.patch(`/api/v1/admin/appointments/${appointmentId}/status`, {
    status,
  });
}

export type { CreateReq as CreateAppointmentReq };

