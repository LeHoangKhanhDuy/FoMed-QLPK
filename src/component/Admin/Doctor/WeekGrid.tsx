import React from "react";

import { Clock } from "lucide-react";
import { ShiftCard } from "./ShiftCard";
import type { Shift } from "../../../types/schedule/types";
import { formatVNDate, isSameDay, toYMD } from "../../../types/schedule/date";

type Props = {
  days: string[]; // YYYY-MM-DD[]
  shifts: Shift[];
  onEdit: (s: Shift) => void;
  onDelete: (id: number) => void;
};

export const WeekGrid: React.FC<Props> = ({
  days,
  shifts,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-4">
      {days.map((d) => (
        <div key={d} className="rounded-xl border bg-white shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">{formatVNDate(d)}</p>
            {isSameDay(d, toYMD(new Date())) && (
              <span className="inline-flex items-center gap-1 rounded-md bg-green-50 text-green-600 px-2 py-0.5 text-xs">
                <Clock className="w-4 h-4" /> Hôm nay
              </span>
            )}
          </div>
          <div className="space-y-2">
            {shifts.filter((s) => s.date === d).length === 0 && (
              <p className="text-sm text-slate-500">Chưa có ca trực</p>
            )}
            {shifts
              .filter((s) => s.date === d)
              .map((s) => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
