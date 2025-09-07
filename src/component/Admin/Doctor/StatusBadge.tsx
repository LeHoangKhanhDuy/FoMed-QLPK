import type { ShiftStatus } from "../../../types/schedule/types";


export const StatusBadge = ({ s }: { s: ShiftStatus }) => {
  const map: Record<ShiftStatus, string> = {
    scheduled: "bg-sky-50 text-sky-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
  };
  const text: Record<ShiftStatus, string> = {
    scheduled: "Lịch sắp tới",
    completed: "Đã hoàn tất",
    cancelled: "Đã huỷ",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}
    >
      {text[s]}
    </span>
  );
};
