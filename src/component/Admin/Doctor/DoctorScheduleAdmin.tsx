import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "../../../auth/auth";
import type {
  Doctor,
  Shift,
  ShiftPayload,
} from "../../../types/schedule/types";
import { addDays, startOfWeek, toYMD } from "../../../types/schedule/date";
import {
  apiCreateShift,
  apiDeleteShift,
  apiListDoctors,
  apiListRooms,
  apiListShifts,
  apiUpdateShift,
} from "../../../types/schedule/mockApi";
import { Toolbar } from "./Toolbar";
import { WeekGrid } from "./WeekGrid";
import { ShiftModal } from "./ShiftModal";
import toast from "react-hot-toast";

export default function DoctorScheduleAdmin() {
  const { hasRole } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
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

  const load = async () => {
    const [ds, ss, rs] = await Promise.all([
      apiListDoctors(),
      apiListShifts({ from: weekFrom, to: weekTo }),
      apiListRooms(),
    ]);
    setDoctors(ds);
    setShifts(ss);
    setRooms(rs);
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
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (s: Shift) => {
    setEditing(s);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: ShiftPayload) => {
    if (editing?.id) {
      const upd = await apiUpdateShift(editing.id, payload);
      setShifts((arr) => arr.map((x) => (x.id === upd.id ? upd : x)));
    } else {
      const created = await apiCreateShift(payload);
      if (
        new Date(created.date) >= new Date(weekFrom) &&
        new Date(created.date) <= new Date(weekTo)
      ) {
        setShifts((arr) => [created, ...arr]);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteShift(id);
      setShifts((arr) => arr.filter((x) => x.id !== id));
      toast.success("Đã xoá lịch làm việc");
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
          canCreate={hasRole(["ADMIN", "EMPLOYEE"])}
        />

        <WeekGrid
          days={weekDays}
          shifts={filtered}
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
