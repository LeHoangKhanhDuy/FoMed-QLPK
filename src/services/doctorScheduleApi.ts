import { authHttp } from "./http";

// DTOs from BE
export type WeeklySlotDto = {
  slotId: number;
  doctorId: number;
  weekday: number; // 1..7 (Mon..Sun)
  startTime: string; // "HH:mm:ss" or "HH:mm"
  endTime: string;   // "HH:mm:ss" or "HH:mm"
  note?: string | null;
  isActive: boolean;
  doctorName?: string;
  roomName?: string | null;
};

export type CreateWeeklySlotRequest = {
  weekday: number; // 1..7
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  note?: string;
};

export type UpdateWeeklySlotRequest = {
  weekday: number;
  startTime: string;
  endTime: string;
  note?: string;
  isActive: boolean;
};

export type CalendarBlockDto = {
  slotId: number;
  doctorId: number;
  doctorName: string;
  roomName?: string | null;
  date: string; // ISO date (DateOnly on BE)
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  note?: string | null;
};

// Create weekly slot for doctor
export async function apiCreateWeeklySlot(
  doctorId: number,
  payload: CreateWeeklySlotRequest
) {
  const { data } = await authHttp.post(`/api/v1/doctors/schedule/${doctorId}`, payload);
  return data;
}

// List weekly slots (not expanded by dates)
export async function apiGetWeeklySlots(doctorId: number) {
  const { data } = await authHttp.get(`/api/v1/doctors/schedule-week/${doctorId}`);
  return data;
}

// Get calendar expanded between dates
export async function apiGetCalendar(params: {
  from: string; // yyyy-MM-dd
  to: string;   // yyyy-MM-dd
  doctorId?: number;
}) {
  const { data } = await authHttp.get(`/api/v1/doctors/calendar`, { params });
  return data;
}

// Update weekly slot
export async function apiUpdateWeeklySlot(
  slotId: number,
  payload: UpdateWeeklySlotRequest
) {
  const { data } = await authHttp.put(`/api/v1/doctors/schedule-update/${slotId}`, payload);
  return data;
}

// Delete (soft) weekly slot
export async function apiDeleteWeeklySlot(slotId: number) {
  // BE path has a small typo 'shedule-delete' per Swagger
  const { data } = await authHttp.delete(`/api/v1/doctors/shedule-delete/${slotId}`);
  return data;
}


