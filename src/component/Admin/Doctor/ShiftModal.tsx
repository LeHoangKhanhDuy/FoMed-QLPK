import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import type {
  Doctor,
  Shift,
  ShiftPayload,
  ShiftStatus,
} from "../../../types/schedule/types";
import { toYMD } from "../../../types/schedule/date";

type Props = {
  open: boolean;
  onClose: () => void;
  doctors: Doctor[];
  initial?: Partial<Shift> & { id?: number };
  onSubmit: (payload: ShiftPayload) => Promise<void>;
};

// ---- helpers: type-safety
const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Có lỗi xảy ra";

const isShiftStatus = (v: string): v is ShiftStatus =>
  v === "scheduled" || v === "completed" || v === "cancelled";

export const ShiftModal: React.FC<Props> = ({
  open,
  onClose,
  doctors,
  initial,
  onSubmit,
}) => {
  const [form, setForm] = useState<ShiftPayload>({
    id: initial?.id,
    doctorId: initial?.doctorId ?? doctors[0]?.id ?? 0,
    date: initial?.date ?? toYMD(new Date()),
    start: initial?.start ?? "08:00",
    end: initial?.end ?? "11:30",
    room: initial?.room ?? "",
    note: initial?.note ?? "",
    status: (initial?.status as ShiftStatus) ?? "scheduled",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      id: initial?.id,
      doctorId: initial?.doctorId ?? doctors[0]?.id ?? 0,
      date: initial?.date ?? toYMD(new Date()),
      start: initial?.start ?? "08:00",
      end: initial?.end ?? "11:30",
      room: initial?.room ?? "",
      note: initial?.note ?? "",
      status: (initial?.status as ShiftStatus) ?? "scheduled",
    });
    setErr(null);
  }, [open, initial, doctors]);

  const onChangeDoctor: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setForm((f) => ({ ...f, doctorId: Number(e.target.value) }));
  };

  const onChangeDate: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setForm((f) => ({ ...f, date: e.target.value }));
  };

  const onChangeStart: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setForm((f) => ({ ...f, start: e.target.value }));
  };

  const onChangeEnd: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setForm((f) => ({ ...f, end: e.target.value }));
  };

  const onChangeRoom: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setForm((f) => ({ ...f, room: e.target.value }));
  };

  const onChangeNote: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setForm((f) => ({ ...f, note: e.target.value }));
  };

  const onChangeStatus: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      status: isShiftStatus(v) ? v : f.status, // giữ an toàn kiểu
    }));
  };

  const submit = async () => {
    if (!form.doctorId) return setErr("Vui lòng chọn bác sĩ");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date))
      return setErr("Ngày không hợp lệ (YYYY-MM-DD)");
    if (!/^\d{2}:\d{2}$/.test(form.start) || !/^\d{2}:\d{2}$/.test(form.end))
      return setErr("Giờ không hợp lệ (HH:mm)");

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
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
          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Bác sĩ</span>
            <select
              value={form.doctorId}
              onChange={onChangeDoctor}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} – {d.specialty}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Ngày (YYYY-MM-DD)</span>
            <input
              value={form.date}
              onChange={onChangeDate}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="2025-09-06"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Giờ bắt đầu</span>
            <input
              value={form.start}
              onChange={onChangeStart}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="08:00"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Giờ kết thúc</span>
            <input
              value={form.end}
              onChange={onChangeEnd}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="11:30"
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-slate-600">Phòng</span>
            <input
              value={form.room ?? ""}
              onChange={onChangeRoom}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Phòng 203"
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-slate-600">Ghi chú</span>
            <textarea
              value={form.note ?? ""}
              onChange={onChangeNote}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              rows={3}
              placeholder="Nội dung ca trực"
            />
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-slate-600">Trạng thái</span>
            <select
              value={form.status}
              onChange={onChangeStatus}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="scheduled">Lịch sắp tới</option>
              <option value="completed">Đã hoàn tất</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-2 rounded-md border hover:bg-gray-50 inline-flex items-center gap-2"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer px-3 py-2 rounded-md bg-primary-linear text-white disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
