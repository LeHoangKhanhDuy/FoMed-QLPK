import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "../../../auth/auth";
import { apiListDoctors, type BEDoctor } from "../../../services/doctorsApi";
import type {
  Doctor,
  Shift,
  ShiftPayload,
} from "../../../types/schedule/types";
import { addDays, startOfWeek, toYMD } from "../../../types/schedule/date";
import {
  apiGetCalendar,
  apiCreateWeeklySlot,
  apiUpdateWeeklySlot,
  apiDeleteWeeklySlot,
} from "../../../services/doctorScheduleApi";
import { Toolbar } from "./Toolbar";
import { WeekGrid } from "./WeekGrid";
import { ShiftModal } from "./ShiftModal";
import toast from "react-hot-toast";
import { showComingSoon } from "../../../common/showComingSoon";

export default function DoctorScheduleAdmin() {
  const { hasRole } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [doctorId, setDoctorId] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState<string[]>([]);

  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date())
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => toYMD(addDays(weekStart, i))),
    [weekStart]
  );
  const weekFrom = weekDays[0];
  const weekTo = weekDays[6];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const canModifySchedule = hasRole(["ADMIN", "EMPLOYEE"]);

  const load = async () => {
    // TODO: Replace with real doctors and rooms APIs if available in your project
    // Tạm thời giữ nguyên doctors/rooms mock nếu đang dùng nơi khác
    // Lấy calendar từ BE
    try {
      setLoadingCalendar(true);
      // Load doctors for select in modal/toolbar
      try {
        const res = await apiListDoctors({ page: 1, limit: 200 });
        const items: BEDoctor[] = res.items ?? [];
        const mappedDoctors: Doctor[] = items.map((d) => ({
          id: d.doctorId,
          name: d.fullName || `BS #${d.doctorId}`,
          specialty: d.primarySpecialtyName || "",
        }));
        setDoctors(mappedDoctors);
        const roomList = Array.from(
          new Set(
            items
              .map((d) => (d.roomName || "").trim())
              .filter((x) => x && x.length > 0) as string[]
          )
        ).sort((a, b) => a.localeCompare(b, "vi"));
        setRooms(roomList);
      } catch (e) {
        console.warn("Không tải được danh sách bác sĩ", e);
      }

      const calRes = await apiGetCalendar({
        from: weekFrom,
        to: weekTo,
        doctorId: doctorId === "all" ? undefined : Number(doctorId),
      });
      const items: Array<{
        slotId: number;
        doctorId: number;
        doctorName: string;
        date: string | Date;
        startTime?: string;
        endTime?: string;
        roomName?: string | null;
      }> = calRes.data || [];
      // Map về Shift[] UI hiện tại
      const mapped: Shift[] = items.map((b) => ({
        id: b.slotId,
        doctorId: b.doctorId,
        doctorName: b.doctorName,
        date:
          typeof b.date === "string"
            ? b.date
            : new Date(b.date).toISOString().slice(0, 10),
        start: (b.startTime || "").slice(0, 5),
        end: (b.endTime || "").slice(0, 5),
        location: b.roomName || undefined,
        status: "scheduled",
      }));
      setShifts(mapped);
    } catch (e) {
      console.error("Failed to load calendar", e);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekFrom, weekTo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shifts.filter((s) => {
      if (doctorId !== "all" && s.doctorId !== doctorId) return false;
      if (!q) return true;
      const timeRange = `${s.start} – ${s.end}`.toLowerCase();
      return (
        s.doctorName.toLowerCase().includes(q) ||
        (s.location?.toLowerCase().includes(q) ?? false) ||
        s.status.toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q) ||
        timeRange.includes(q)
      );
    });
  }, [shifts, doctorId, query]);

  const openCreate = () => {
    if (!canModifySchedule) {
      showComingSoon();
      return;
    }
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (s: Shift) => {
    if (!canModifySchedule) {
      toast.error("Chỉ Admin và Nhân viên mới được sửa lịch");
      return;
    }
    setEditing(s);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: ShiftPayload) => {
    // Map ShiftPayload -> CreateWeeklySlotRequest
    const weekday = new Date(payload.date).getDay();
    const weekdayMap = [7, 1, 2, 3, 4, 5, 6]; // Sun->7, Mon->1 ...
    const req = {
      weekday: weekdayMap[weekday],
      startTime:
        payload.start.length === 5 ? `${payload.start}:00` : payload.start,
      endTime: payload.end.length === 5 ? `${payload.end}:00` : payload.end,
      note: payload.location,
    };
    try {
      if (!canModifySchedule) {
        toast.error("Chỉ Admin và Nhân viên mới được tạo/sửa lịch");
        return;
      }
      if (editing?.id) {
        await apiUpdateWeeklySlot(editing.id, { ...req, isActive: true });
        toast.success("Cập nhật lịch làm việc thành công");
      } else {
        await apiCreateWeeklySlot(Number(payload.doctorId), req);
        toast.success("Tạo lịch làm việc lặp tuần thành công");
      }
      // Refresh calendar in background to close modal faster
      setTimeout(() => {
        load();
      }, 0);
    } catch (e) {
      console.error(e);
      const errorWithResponse = e as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        errorWithResponse?.response?.data?.message ||
          "Thao tác không thành công"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!canModifySchedule) {
        toast.error("Chỉ Admin và Nhân viên mới được xoá lịch");
        return;
      }
      await apiDeleteWeeklySlot(id);
      toast.success("Đã xoá lịch làm việc");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Xoá không thành công");
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-6 h-6 text-sky-500" />
        <h1 className="text-xl font-bold">Quản lý lịch làm việc bác sĩ</h1>
      </header>

      <div className="rounded-xl border bg-white p-4 shadow-xs space-y-4">
        <Toolbar
          weekFrom={weekFrom}
          weekTo={weekTo}
          onPrev={() => setWeekStart((d) => addDays(d, -7))}
          onNext={() => setWeekStart((d) => addDays(d, 7))}
          onToday={() => setWeekStart(startOfWeek(new Date()))}
          doctors={doctors}
          doctorId={doctorId}
          setDoctorId={setDoctorId}
          query={query}
          setQuery={setQuery}
          openCreate={openCreate}
          canCreate={canModifySchedule}
        />

        <WeekGrid
          days={weekDays}
          shifts={filtered}
          loading={loadingCalendar}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      <ShiftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        doctors={doctors}
        initial={editing ?? undefined}
        onSubmit={handleSubmit}
        rooms={rooms}
      />
    </section>
  );
}
