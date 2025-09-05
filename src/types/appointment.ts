// ===== Types dùng chung cho CSM FoMed =====
export type AppointmentStatus =
  | "pending" // đang chờ
  | "booked" // đã đặt (bệnh nhân tự đặt hoặc đã duyệt)
  | "done" // đã khám
  | "cancelled"; // đã huỷ

export type AppointmentPayload = {
  patientName: string;
  patientPhone: string;
  clinicId: number | "";
  doctorId: number | "";
  serviceId: number | "";
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note?: string;
};

export type Appointment = {
  id: number;
  code: string;
  patientName: string;
  patientPhone: string;
  clinicName: string;
  doctorName: string;
  serviceName: string;
  date: string; // ISO date
  time: string; // "09:00"
  status: AppointmentStatus;
  createdAt: string; // ISO
};
