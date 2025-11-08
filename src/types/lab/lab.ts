export type LabStatus =
  | "pending"
  | "processing"
  | "completed"
  | "abnormal"
  | "canceled";
export type LabFlag = "N" | "L" | "H" | "A";

export interface LabPatient {
  code: string;
  full_name: string;
  dob: string; // ISO date
  sex: "M" | "F";
}

export interface LabResultItem {
  id: number;
  analyte: string;
  result: string;
  unit?: string;
  refRange?: string;
  flag?: LabFlag;
  note?: string;
}

export interface LabResultDetail {
  id: number;
  result_code: string;
  collected_at?: string;
  reported_at?: string;
  sample_type?: string;
  service_name: string;
  ordered_by?: string;
  status: LabStatus;
  patient: LabPatient;
  items: LabResultItem[];
  notes?: string;
  warnings?: string[];
}
