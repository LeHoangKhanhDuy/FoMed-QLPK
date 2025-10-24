
export type Sex = "Nam" | "Nữ" | "Khác";

export interface Patient {
  id: number;
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
  appointmentId: number;
  patientId: number;
  symptoms: string;
  diagnosis: string;
  note?: string | null;
}

export interface LabItem {
  id: number;
  name: string;
  code: string;
  // sample?: "blood" | "urine" | "swab" | "other";
  sample?: string | null;
}

export interface LabOrderPayload {
  appointmentId: number;
  patientId: number;
  items: number[]; // danh sách id xét nghiệm
  note?: string | null;
  priority?: "normal" | "urgent";
}

export interface Drug {
  id: number;
  name: string;
  unit: string; // viên, ống, ml...
  maxPerDay?: number;
}

export interface PrescriptionLine {
  drugId: number;
  dose: string; // "1 viên"
  frequency: string; // "2 lần/ngày"
  duration: string; // "5 ngày"
  note?: string | null;
}

export interface PrescriptionPayload {
  appointmentId: number;
  patientId: number;
  lines: PrescriptionLine[];
  advice?: string | null; // dặn dò
}

export type WorkspaceCatalogs = {
  labTests: LabItem[];
  medicines: Array<{ 
    id: number; 
    name: string; 
    unit?: string | null;
    isActive?: boolean;
    stock?: number;
    status?: string;
  }>;
};

export type StartEncounterPayload = {
  appointmentId: number;
};

export type CompleteEncounterPayload = {
  appointmentId: number;
};