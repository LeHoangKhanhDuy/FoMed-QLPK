import React from "react";
import {
  Edit,
  Trash2,
  Stethoscope,
  XCircle,
  CalendarCheck,
} from "lucide-react";
import type { Shift, ScheduleStatus } from "../../../types/schedule/types";

type Props = {
  shift: Shift;
  onEdit: (s: Shift) => void;
  onDelete: (id: number) => void;
};

const STATUS_UI: Record<
  ScheduleStatus,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  working: {
    label: "Đang trực",
    icon: <Stethoscope className="w-5 h-5" />,
    cls: "bg-green-50 text-green-600 ring-1 ring-green-200",
  },
  scheduled: {
    label: "Đã lên lịch",
    icon: <CalendarCheck className="w-5 h-5" />,
    cls: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  },
  cancelled: {
    label: "Hủy lịch",
    icon: <XCircle className="w-5 h-5" />,
    cls: "bg-red-50 text-red-600 ring-1 ring-red-200",
  },
};

function StatusBadge({ status }: { status: ScheduleStatus }) {
  const ui = STATUS_UI[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--rounded)] text-sm font-medium",
        ui.cls,
      ].join(" ")}
      title={ui.label}
    >
      {ui.icon}
      {ui.label}
    </span>
  );
}

// dd/MM/yyyy
const fmtDate = (ymd: string) => {
  const m = /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd.split("-") : null;
  if (!m) return ymd;
  const [y, mo, d] = m;
  return `${d}/${mo}/${y}`;
};

export const ShiftCard: React.FC<Props> = ({ shift, onEdit, onDelete }) => {
  return (
    <section className="h-[120px] md:h-[200px] flex flex-col justify-between">
      {/* ===== Mobile layout (≤640px) ===== */}
      <div className="sm:hidden space-y-4">
        {/* Row 1: Doctor name — Status */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-bold leading-snug line-clamp-2">
            {shift.doctorName}
          </p>
          <StatusBadge status={shift.status} />
        </div>

        {/* Row 2: Date — Location */}
        <div className="flex items-center justify-between text-md">
          <span className="opacity-90">{fmtDate(shift.date)}</span>
          {shift.location && (
            <span className="opacity-90">{shift.location}</span>
          )}
        </div>
      </div>

      {/* ===== Desktop layout (giữ nguyên) ===== */}
      <div className="hidden sm:block space-y-2">
        <p className="mt-1 text-lg font-bold">{shift.doctorName}</p>

        <p className="text-md">
          {shift.start} – {shift.end}
        </p>

        {shift.location && <p className="text-md mb-3">{shift.location}</p>}

        {/* Badge trạng thái */}
        <StatusBadge status={shift.status} />
      </div>

      {/* Buttons (giữ nguyên cho cả mobile/desktop) */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => onEdit(shift)}
          className="cursor-pointer inline-flex items-center gap-1 px-2 py-2 rounded-[var(--rounded)] bg-warning-linear text-white text-sm"
        >
          <Edit className="w-5 h-5" /> Sửa
        </button>
        <button
          onClick={() => onDelete(shift.id)}
          className="cursor-pointer inline-flex items-center gap-1 px-2 py-2 rounded-[var(--rounded)] bg-error-linear text-white text-sm"
        >
          <Trash2 className="w-5 h-5" /> Xoá
        </button>
      </div>
    </section>
  );
};
