// ===== Types dùng chung cho đặt lịch =====

export type AppointmentStatus =
  | "waiting" // Đang chờ
  | "booked" // Đã đặt
  | "done" // Đã khám
  | "cancelled" // Đã hủy
  | "no_show"; // Vắng mặt

export type AppointmentSource = "ONLINE" | "RECEPTION";

// Payload phía FE khi tạo lịch (BE sẽ map thành ScheduledAt, PatientId...)
export type AppointmentPayload = {
  patientName: string;
  patientPhone: string;

  doctorId: number | "";
  // Tùy hệ CSDL, có thể không lưu trực tiếp service vào Appointments:
  serviceId?: number | "";

  date: string; // YYYY-MM-DD
  time: string; // HH:mm

  reason?: string; // <= 255, map Reason
  source: AppointmentSource; // ONLINE / RECEPTION
  queueNo?: number; // map QueueNo (nếu RECEPTION)
};

// Dùng cho list hiển thị
export type Appointment = {
  id: number;
  code: string;

  patientName: string;
  patientPhone: string;

  doctorName: string;
  serviceName?: string; // giữ để hiển thị mock

  date: string; // YYYY-MM-DD
  time: string; // HH:mm

  status: AppointmentStatus; // map từ StatusId
  createdAt: string; // ISO
};
