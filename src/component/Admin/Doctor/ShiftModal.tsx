import React, { useEffect, useMemo, useState } from "react";
import { X, Save, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Doctor,
  Shift,
  ShiftPayload,
  ScheduleStatus,
} from "../../../types/schedule/types";
import { toYMD } from "../../../types/schedule/date";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Có lỗi xảy ra";

const isStatus = (v: string): v is ScheduleStatus =>
  v === "scheduled" || v === "working" || v === "cancelled";

const pad = (n: number) => n.toString().padStart(2, "0");

// ymd <-> dmy
const ymdToDmy = (ymd: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
};
const dmyToYmd = (dmy: string) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dmy)) return null;
  const [d, m, y] = dmy.split("/");
  return `${y}-${m}-${d}`;
};

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMin = (m: number) => {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad(((hh % 24) + 24) % 24)}:${pad(((mm % 60) + 60) % 60)}`;
};

// ----- Props -----
type Props = {
  open: boolean;
  onClose: () => void;
  doctors: Doctor[];
  initial?: Partial<Shift> & { id?: number };
  onSubmit: (payload: ShiftPayload) => Promise<void>;
  rooms: string[];
};

// ⚠️ Dùng state riêng cho form để cho phép doctorId = ""
type FormState = Omit<ShiftPayload, "doctorId"> & { doctorId: number | "" };

const MIN_STEP = 5;
const hourOptions: SelectOption<string>[] = Array.from(
  { length: 24 },
  (_, h) => {
    const label = pad(h);
    return { value: label, label };
  }
);
const minuteOptions: SelectOption<string>[] = Array.from(
  { length: 60 / MIN_STEP },
  (_, i) => {
    const label = pad(i * MIN_STEP);
    return { value: label, label };
  }
);
const statusOptions: SelectOption<ScheduleStatus>[] = [
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "working", label: "Đang trực" },
  { value: "cancelled", label: "Hủy lịch" },
];

export const ShiftModal: React.FC<Props> = ({
  open,
  onClose,
  doctors,
  initial,
  onSubmit,
  rooms,
}) => {
  const [form, setForm] = useState<FormState>({
    id: initial?.id,
    // ✅ tạo mới thì để "", edit thì fill sẵn
    doctorId: initial?.doctorId ?? "",
    date: initial?.date ?? toYMD(new Date()),
    start: initial?.start ?? "08:00",
    end: initial?.end ?? "17:00",
    location: initial?.location ?? "",
    status: (initial?.status as ScheduleStatus) ?? "scheduled",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calendar state
  const [calOpen, setCalOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    new Date().getMonth()
  );

  const roomOptions: SelectOption<string>[] = rooms.map((r) => ({
    value: r,
    label: r,
  }));

  // Đồng bộ tháng/năm hiển thị lịch
  useEffect(() => {
    if (!open) return;
    const d =
      form.date && /^\d{4}-\d{2}-\d{2}$/.test(form.date)
        ? new Date(form.date)
        : new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [form.date, open]);

  // Khi open modal: nếu edit → fill, nếu tạo mới → doctorId = ""
  useEffect(() => {
    if (!open) return;
    setForm({
      id: initial?.id,
      doctorId: initial?.doctorId ?? "",
      date: initial?.date ?? toYMD(new Date()),
      start: initial?.start ?? "08:00",
      end: initial?.end ?? "17:00",
      location: initial?.location ?? "",
      status: (initial?.status as ScheduleStatus) ?? "scheduled",
    });
    setErr(null);
  }, [open, initial, doctors]);

  const doctorOptions: SelectOption<number>[] = doctors.map((d) => ({
    value: d.id,
    label: `${d.name} – ${d.specialty}`,
  }));

  // start/end logic
  const [sH, sM] = form.start.split(":");
  const [eH, eM] = form.end.split(":");
  const setStartHM = (hh?: string, mm?: string) => {
    const [curH, curM] = form.start.split(":");
    const newStart = `${hh ?? curH}:${mm ?? curM}`;
    setForm((f) => {
      const next = { ...f, start: newStart };
      if (toMin(next.end) <= toMin(newStart)) {
        next.end = fromMin(toMin(newStart) + 30);
      }
      return next;
    });
  };
  const setEndHM = (hh?: string, mm?: string) => {
    const [curH, curM] = form.end.split(":");
    const newEnd = `${hh ?? curH}:${mm ?? curM}`;
    setForm((f) => ({ ...f, end: newEnd }));
  };

  // calendar computed
  const monthLabel = useMemo(
    () => `${pad(viewMonth + 1)}/${viewYear}`,
    [viewMonth, viewYear]
  );
  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startIdx = (first.getDay() + 6) % 7;
    const total = last.getDate();
    const arr: Array<{ d: number; ymd: string }> = [];
    for (let i = 1; i <= total; i++) {
      const ymd = `${viewYear}-${pad(viewMonth + 1)}-${pad(i)}`;
      arr.push({ d: i, ymd });
    }
    return { startIdx, arr };
  }, [viewYear, viewMonth]);

  const isToday = (ymd: string) => {
    const now = new Date();
    const t = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    return ymd === t;
  };
  const isSelected = (ymd: string) => form.date === ymd;

  const gotoPrevMonth = () =>
    setViewMonth((m) => (m === 0 ? (setViewYear((y) => y - 1), 11) : m - 1));
  const gotoNextMonth = () =>
    setViewMonth((m) => (m === 11 ? (setViewYear((y) => y + 1), 0) : m + 1));

  // submit
  const submit = async () => {
    if (form.doctorId === "" || !form.doctorId) {
      return setErr("Vui lòng chọn bác sĩ");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date))
      return setErr("Ngày không hợp lệ (YYYY-MM-DD)");
    if (!/^\d{2}:\d{2}$/.test(form.start) || !/^\d{2}:\d{2}$/.test(form.end))
      return setErr("Giờ không hợp lệ (HH:mm)");
    if (toMin(form.end) <= toMin(form.start))
      return setErr("Giờ kết thúc phải lớn hơn giờ bắt đầu");
    if (!isStatus(form.status)) return setErr("Trạng thái không hợp lệ");
    if (!form.location) return setErr("Vui lòng chọn phòng làm việc");

    setLoading(true);
    try {
      // ép kiểu doctorId về number khi gửi
      const payload: ShiftPayload = {
        ...form,
        doctorId: Number(form.doctorId),
      };
      await onSubmit(payload);
      onClose();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 p-2 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase">
            {form.id ? "Sửa ca trực" : "Thêm ca trực"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Bác sĩ */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Bác sĩ</span>
              <p className="text-red-500">*</p>
            </div>
            <SelectMenu
              value={form.doctorId} // ✅ có thể là ""
              onChange={(v) => {
                // v: number | ""
                setForm((f) => ({ ...f, doctorId: v as number | "" }));
              }}
              options={doctorOptions}
              placeholder="Chọn bác sĩ"
              className="w-full"
            />
          </label>

          {/* Ngày */}
          <div className="text-sm relative">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Ngày</span>
              <p className="text-red-500">*</p>
            </div>
            <div className="mt-1 flex gap-2">
              <input
                value={ymdToDmy(form.date)}
                onChange={(e) => {
                  const ymd = dmyToYmd(e.target.value);
                  if (ymd) {
                    setForm((f) => ({ ...f, date: ymd }));
                    const d = new Date(ymd);
                    setViewYear(d.getFullYear());
                    setViewMonth(d.getMonth());
                  }
                }}
                placeholder="dd/mm/yyyy"
                className="w-full rounded-[var(--rounded)] border px-3 py-3.5 shadow-xs outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setCalOpen((s) => !s)}
                className="cursor-pointer px-3 rounded-[var(--rounded)] border hover:bg-gray-50 inline-flex items-center"
                title="Chọn trên lịch"
              >
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </button>
            </div>

            {calOpen && (
              <div className="absolute z-10 mt-2 w-[320px] rounded-xl border bg-white shadow-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={gotoPrevMonth}
                    className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
                    title="Tháng trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="font-medium">{monthLabel}</div>
                  <button
                    onClick={gotoNextMonth}
                    className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
                    title="Tháng sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
                  <div>T2</div>
                  <div>T3</div>
                  <div>T4</div>
                  <div>T5</div>
                  <div>T6</div>
                  <div>T7</div>
                  <div>CN</div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: days.startIdx }).map((_, i) => (
                    <div key={`emp-${i}`} />
                  ))}
                  {days.arr.map(({ d, ymd }) => {
                    const selected = isSelected(ymd);
                    const today = isToday(ymd);
                    return (
                      <button
                        key={ymd}
                        onClick={() => {
                          setForm((f) => ({ ...f, date: ymd }));
                          setCalOpen(false);
                        }}
                        className={[
                          "cursor-pointer h-9 rounded-md text-sm",
                          "hover:bg-slate-100",
                          selected && "bg-sky-500 text-white hover:bg-sky-500",
                          !selected && today && "ring-1 ring-sky-400",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        title={ymdToDmy(ymd)}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Giờ bắt đầu */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Giờ bắt đầu</span>
              <p className="text-red-500">*</p>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <SelectMenu
                value={sH}
                onChange={(v) => {
                  if (v !== "") setStartHM(String(v), undefined);
                }}
                options={hourOptions}
                placeholder="HH"
                className="w-full"
              />
              <span className="px-1 text-slate-500">:</span>
              <SelectMenu
                value={sM}
                onChange={(v) => {
                  if (v !== "") setStartHM(undefined, String(v));
                }}
                options={minuteOptions}
                placeholder="mm"
                className="w-full"
              />
            </div>
          </label>

          {/* Giờ kết thúc */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Giờ kết thúc</span>
              <p className="text-red-500">*</p>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <SelectMenu
                value={eH}
                onChange={(v) => {
                  if (v !== "") setEndHM(String(v), undefined);
                }}
                options={hourOptions}
                placeholder="HH"
                className="w-full"
              />
              <span className="px-1 text-slate-500">:</span>
              <SelectMenu
                value={eM}
                onChange={(v) => {
                  if (v !== "") setEndHM(undefined, String(v));
                }}
                options={minuteOptions}
                placeholder="mm"
                className="w-full"
              />
            </div>
          </label>

          {/* Vị trí làm việc + Trạng thái (cùng hàng) */}
          <div className="grid grid-cols-2 sm:col-span-2 gap-3">
            {/* Phòng làm việc */}
            <label className="text-sm">
              <div className="flex items-center gap-1">
                <span className="block mb-1 text-slate-600">
                  Phòng làm việc
                </span>
                <p className="text-red-500">*</p>
              </div>
              <SelectMenu
                value={form.location ?? ""} // có thể là ""
                onChange={(v) => {
                  setForm((f) => ({ ...f, location: (v as string) || "" }));
                }}
                options={roomOptions}
                placeholder="Chọn phòng"
                className="w-full"
              />
            </label>

            {/* Trạng thái */}
            <label className="text-sm">
              <div className="flex items-center gap-1">
                <span className="block mb-1 text-slate-600">Trạng thái</span>
                <p className="text-red-500">*</p>
              </div>
              <SelectMenu
                value={form.status}
                onChange={(v) => {
                  if (v !== "" && isStatus(String(v)))
                    setForm((f) => ({ ...f, status: v }));
                }}
                options={statusOptions}
                placeholder="Chọn trạng thái"
                className="w-full"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer h-10 px-3 rounded-[var(--rounded)] border hover:bg-gray-50 inline-flex items-center gap-2"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer h-10 px-3 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
