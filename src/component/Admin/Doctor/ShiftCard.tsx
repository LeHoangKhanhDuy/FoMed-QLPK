import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Shift } from "../../../types/schedule/types";

type Props = {
  shift: Shift;
  onEdit: (s: Shift) => void;
  onDelete: (id: number) => void;
};

export const ShiftCard: React.FC<Props> = ({ shift, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border p-3 bg-white shadow-xs">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          {shift.start} – {shift.end}
        </p>
        <StatusBadge s={shift.status} />
      </div>
      <p className="mt-1 text-sm text-slate-600">{shift.doctorName}</p>
      {shift.room && <p className="text-xs text-slate-500">{shift.room}</p>}
      {shift.note && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{shift.note}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => onEdit(shift)}
          className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:bg-gray-50 text-slate-700 text-xs"
        >
          <Edit className="w-4 h-4" /> Sửa
        </button>
        <button
          onClick={() => onDelete(shift.id)}
          className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs"
        >
          <Trash2 className="w-4 h-4" /> Xoá
        </button>
      </div>
    </div>
  );
};
