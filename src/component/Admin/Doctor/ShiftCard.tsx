import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Stethoscope,
  XCircle,
  CalendarCheck,
} from "lucide-react";
import type { Shift, ScheduleStatus } from "../../../types/schedule/types";
import ConfirmModal from "../../../common/ConfirmModal";

type Props = {
  shift: Shift;
  onEdit: (s: Shift) => void;
  onDelete: (id: number) => void; // parent thực hiện API & cập nhật state
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

const fmtDate = (ymd: string) => {
  const m = /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd.split("-") : null;
  if (!m) return ymd;
  const [y, mo, d] = m;
  return `${d}/${mo}/${y}`;
};

export const ShiftCard: React.FC<Props> = ({ shift, onEdit, onDelete }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const askDelete = () => setConfirmOpen(true);

  const doDelete = async () => {
    setConfirmLoading(true);
    try {
      // giao cho parent lo API + cập nhật danh sách
      await Promise.resolve(onDelete(shift.id));
      setConfirmOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <section className="h-[120px] md:h-[200px] flex flex-col justify-between">
      {/* Mobile */}
      <div className="sm:hidden space-y-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-bold leading-snug line-clamp-2">
            {shift.doctorName}
          </p>
          <StatusBadge status={shift.status} />
        </div>
        <div className="flex items-center justify-between text-md">
          <span className="opacity-90">{fmtDate(shift.date)}</span>
          {shift.location && (
            <span className="opacity-90">{shift.location}</span>
          )}
        </div>
      </div>

      {/* Desktop (giữ nguyên) */}
      <div className="hidden sm:block space-y-2">
        <p className="mt-1 text-lg font-bold">{shift.doctorName}</p>
        <p className="text-md">
          {shift.start} – {shift.end}
        </p>
        {shift.location && <p className="text-md mb-3">{shift.location}</p>}
        <StatusBadge status={shift.status} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => onEdit(shift)}
          className="cursor-pointer inline-flex items-center gap-1 px-2 py-2 rounded-[var(--rounded)] bg-warning-linear text-white text-sm"
        >
          <Edit className="w-5 h-5" /> Sửa
        </button>
        <button
          onClick={askDelete}
          className="cursor-pointer inline-flex items-center gap-1 px-2 py-2 rounded-[var(--rounded)] bg-error-linear text-white text-sm"
        >
          <Trash2 className="w-5 h-5" /> Xoá
        </button>
      </div>

      {/* Confirm delete */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        loading={confirmLoading}
        title="Xoá lịch làm việc!"
        description="Bạn có chắc muốn xoá lịch làm việc này?"
        confirmText="Xoá"
        cancelText="Huỷ"
        danger
      />
    </section>
  );
};
