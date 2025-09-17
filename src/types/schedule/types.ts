export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  title?: string;
};

export type ScheduleStatus = "scheduled" | "working" | "cancelled";

export type Shift = {
  id: number; // ScheduleId
  doctorId: number;
  doctorName: string; // denormalized để hiển thị nhanh
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  location?: string; // phòng/khoa/bệnh viện
  status: ScheduleStatus;
};

export type ShiftPayload = Omit<Shift, "id" | "doctorName"> & {
  id?: number; // khi edit
};
