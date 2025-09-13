
export type ID = number;

export type Sex = "Nam" | "Nữ" | "Khác";

export interface Patient {
  id: ID;
  code: string; // mã hồ sơ/đăng ký
  name: string;
  sex: Sex;
  dob: string; // YYYY-MM-DD
  phone?: string;
  service: string;
  visitTime: string; // ISO hoặc "HH:mm"
  status: "Chờ khám" | "Đã đặt" | "Đã khám" | "Đã hủy" | "Vắng mặt";
}

export interface DiagnosisPayload {
  patientId: ID;
  symptoms: string;
  diagnosis: string;
  note?: string;
}

export interface LabItem {
  id: ID;
  name: string;
  code: string;
  sample?: "blood" | "urine" | "swab" | "other";
}

export interface LabOrderPayload {
  patientId: ID;
  items: ID[]; // danh sách id xét nghiệm
  note?: string;
  priority?: "normal" | "urgent";
}

export interface Drug {
  id: ID;
  name: string;
  unit: string; // viên, ống, ml...
  maxPerDay?: number;
}

export interface PrescriptionLine {
  drugId: ID;
  dose: string; // "1 viên"
  frequency: string; // "2 lần/ngày"
  duration: string; // "5 ngày"
  note?: string;
}

export interface PrescriptionPayload {
  patientId: ID;
  lines: PrescriptionLine[];
  advice?: string; // dặn dò
}
