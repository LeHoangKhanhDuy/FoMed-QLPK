import React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Plus,
  Search,
} from "lucide-react";
import type { Doctor } from "../../../types/schedule/types";

type Props = {
  weekFrom: string;
  weekTo: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  doctors: Doctor[];
  doctorId: number | "all";
  setDoctorId: (v: number | "all") => void;
  query: string;
  setQuery: (s: string) => void;
  openCreate: () => void;
};

export const Toolbar: React.FC<Props> = ({
  weekFrom,
  weekTo,
  onPrev,
  onNext,
  onToday,
  doctors,
  doctorId,
  setDoctorId,
  query,
  setQuery,
  openCreate,
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="cursor-pointer p-2 rounded-md border hover:bg-gray-50"
          title="Tuần trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="px-3 py-2 rounded-md border bg-white text-sm flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-500" />
          <span className="font-medium">{weekFrom}</span>
          <span className="text-slate-400">→</span>
          <span className="font-medium">{weekTo}</span>
        </div>
        <button
          onClick={onNext}
          className="cursor-pointer p-2 rounded-md border hover:bg-gray-50"
          title="Tuần sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={onToday}
          className="cursor-pointer p-2 rounded-md border hover:bg-gray-50 inline-flex items-center gap-2"
          title="Về tuần hiện tại"
        >
          <RefreshCcw className="w-4 h-4" /> Hôm nay
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <label className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bác sĩ / mã ca / ghi chú…"
            className="w-full sm:w-80 rounded-md border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>

        <select
          value={doctorId}
          onChange={(e) =>
            setDoctorId(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">Tất cả bác sĩ</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} – {d.specialty}
            </option>
          ))}
        </select>

        <button
          onClick={openCreate}
          className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-linear text-white"
        >
          <Plus className="w-4 h-4" /> Thêm ca
        </button>
      </div>
    </div>
  );
};
