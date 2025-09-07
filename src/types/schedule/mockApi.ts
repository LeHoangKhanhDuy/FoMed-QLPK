import { todayOffset } from "./date";
import type { Doctor, Shift, ShiftPayload } from "./types";


const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: "BS. Nguyễn Minh An", specialty: "Nội tổng quát" },
  { id: 2, name: "BS. Trần Thảo Vy", specialty: "Tai mũi họng" },
  { id: 3, name: "BS. Phạm Quốc Huy", specialty: "Tim mạch" },
  { id: 4, name: "BS. Lê Thu Hà", specialty: "Nhi" },
];

let SHIFT_AUTO_ID = 1000;

let MOCK_SHIFTS: Shift[] = [
  {
    id: SHIFT_AUTO_ID++,
    code: "CA-0001",
    doctorId: 1,
    doctorName: "BS. Nguyễn Minh An",
    date: todayOffset(-1),
    start: "08:00",
    end: "11:30",
    room: "Phòng 203",
    status: "scheduled",
    note: "Khám tổng quát",
  },
  {
    id: SHIFT_AUTO_ID++,
    code: "CA-0002",
    doctorId: 2,
    doctorName: "BS. Trần Thảo Vy",
    date: todayOffset(0),
    start: "13:30",
    end: "17:00",
    room: "Phòng 105",
    status: "scheduled",
  },
  {
    id: SHIFT_AUTO_ID++,
    code: "CA-0003",
    doctorId: 3,
    doctorName: "BS. Phạm Quốc Huy",
    date: todayOffset(2),
    start: "08:00",
    end: "12:00",
    room: "Phòng 305",
    status: "completed",
  },
];

export async function apiListDoctors(): Promise<Doctor[]> {
  await delay(200);
  return [...MOCK_DOCTORS];
}

export async function apiListShifts(params: {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}): Promise<Shift[]> {
  await delay(200);
  const { from, to } = params;
  const f = new Date(from);
  const t = new Date(to);
  return MOCK_SHIFTS.filter((s) => {
    const d = new Date(s.date);
    return d >= f && d <= t;
  });
}

export async function apiCreateShift(payload: ShiftPayload): Promise<Shift> {
  await delay(200);
  const d = MOCK_DOCTORS.find((x) => x.id === payload.doctorId);
  const newShift: Shift = {
    id: SHIFT_AUTO_ID++,
    code: `CA-${String(SHIFT_AUTO_ID).padStart(4, "0")}`,
    doctorName: d?.name ?? "",
    ...payload,
  } as Shift;
  MOCK_SHIFTS.push(newShift);
  return newShift;
}

export async function apiUpdateShift(
  id: number,
  payload: ShiftPayload
): Promise<Shift> {
  await delay(200);
  const idx = MOCK_SHIFTS.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Không tìm thấy ca trực");
  const d = MOCK_DOCTORS.find((x) => x.id === payload.doctorId);
  const upd: Shift = {
    ...MOCK_SHIFTS[idx],
    ...payload,
    doctorName: d?.name ?? MOCK_SHIFTS[idx].doctorName,
  } as Shift;
  MOCK_SHIFTS[idx] = upd;
  return upd;
}

export async function apiDeleteShift(id: number): Promise<void> {
  await delay(150);
  MOCK_SHIFTS = MOCK_SHIFTS.filter((x) => x.id !== id);
}
