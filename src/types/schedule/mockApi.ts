import { todayOffset } from "./date";
import type { Doctor, Shift, ShiftPayload } from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "BS. Nguyễn Minh An",
    specialty: "Nội tổng quát",
    title: "BS CKI",
  },
  { id: 2, name: "BS. Trần Thảo Vy", specialty: "Tai mũi họng" },
  { id: 3, name: "BS. Phạm Quốc Huy", specialty: "Tim mạch" },
  { id: 4, name: "BS. Lê Thu Hà", specialty: "Nhi" },
];

export const MOCK_ROOMS = [
  "Phòng 101",
  "Phòng 105",
  "Phòng 203",
  "Phòng 305",
  "Phòng 402",
];

let SHIFT_AUTO_ID = 1000;

let MOCK_SHIFTS: Shift[] = [
  {
    id: SHIFT_AUTO_ID++,
    doctorId: 1,
    doctorName: "BS. Nguyễn Minh An",
    date: todayOffset(-1),
    start: "08:00",
    end: "11:30",
    location: "Phòng 203",
    status: "working",
  },
  {
    id: SHIFT_AUTO_ID++,
    doctorId: 2,
    doctorName: "BS. Trần Thảo Vy",
    date: todayOffset(0),
    start: "13:30",
    end: "17:00",
    location: "Phòng 105",
    status: "scheduled",
  },
  {
    id: SHIFT_AUTO_ID++,
    doctorId: 3,
    doctorName: "BS. Phạm Quốc Huy",
    date: todayOffset(2),
    start: "08:00",
    end: "12:00",
    location: "Phòng 305",
    status: "cancelled",
  },
];

export async function apiListDoctors(): Promise<Doctor[]> {
  await delay(150);
  return [...MOCK_DOCTORS];
}

export async function apiListRooms(): Promise<string[]> {
  await delay(100);
  return [...MOCK_ROOMS];
}

export async function apiListShifts(params: {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}): Promise<Shift[]> {
  await delay(150);
  const f = new Date(params.from);
  const t = new Date(params.to);
  return MOCK_SHIFTS.filter((s) => {
    const d = new Date(s.date);
    return d >= f && d <= t;
  });
}

export async function apiCreateShift(payload: ShiftPayload): Promise<Shift> {
  await delay(150);
  const d = MOCK_DOCTORS.find((x) => x.id === payload.doctorId);
  const newShift: Shift = {
    id: SHIFT_AUTO_ID++,
    doctorName: d?.name ?? "",
    ...payload,
  };
  MOCK_SHIFTS.push(newShift);
  return newShift;
}

export async function apiUpdateShift(
  id: number,
  payload: ShiftPayload
): Promise<Shift> {
  await delay(150);
  const idx = MOCK_SHIFTS.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Không tìm thấy ca trực");
  const d = MOCK_DOCTORS.find((x) => x.id === payload.doctorId);
  const upd: Shift = {
    ...MOCK_SHIFTS[idx],
    ...payload,
    doctorName: d?.name ?? MOCK_SHIFTS[idx].doctorName,
  };
  MOCK_SHIFTS[idx] = upd;
  return upd;
}

export async function apiDeleteShift(id: number): Promise<void> {
  await delay(120);
  MOCK_SHIFTS = MOCK_SHIFTS.filter((x) => x.id !== id);
}
