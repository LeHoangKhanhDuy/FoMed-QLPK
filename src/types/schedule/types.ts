export type Doctor = {
  id: number;
  name: string;
  specialty: string;
};

export type ShiftStatus = "scheduled" | "completed" | "cancelled";

export type Shift = {
  id: number;
  code: string;
  doctorId: number;
  doctorName: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  room?: string;
  note?: string;
  status: ShiftStatus;
};

export type ShiftPayload = Omit<Shift, "id" | "doctorName" | "code"> & {
  id?: number; // khi edit
};
