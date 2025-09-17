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
import { SelectMenu, type SelectOption } from "../../ui/select-menu";

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
  const options: SelectOption<number | "all">[] = [
    { value: "all", label: "Tất cả bác sĩ" },
    ...doctors.map((d) => ({
      value: d.id,
      label: `${d.name} – ${d.specialty}`,
    })),
  ];

  // class tái dùng để đồng bộ kích thước
  const squareBtn =
    "cursor-pointer h-12 w-12 inline-flex items-center justify-center rounded-[var(--rounded)] border bg-white hover:bg-gray-50";
  const pillBtn =
    "group cursor-pointer h-12 px-4  inline-flex items-center gap-2 rounded-[var(--rounded)] border bg-white text-red-500 hover:bg-gray-50";
  const inputCls =
    "mt-1 h-12 w-full sm:w-80 rounded-[var(--rounded)] border pl-9 pr-3 outline-none focus:ring-2 focus:ring-sky-500";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className={squareBtn} title="Tuần trước">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="h-12 px-3 rounded-[var(--rounded)] border bg-white text-sm inline-flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-500" />
          <span className="font-medium">{weekFrom}</span>
          <span className="text-slate-400">→</span>
          <span className="font-medium">{weekTo}</span>
        </div>

        <button onClick={onNext} className={squareBtn} title="Tuần sau">
          <ChevronRight className="w-5 h-5" />
        </button>

        <button onClick={onToday} className={pillBtn} title="Về tuần hiện tại">
          <RefreshCcw className="w-4 h-4 transform transition-transform duration-500 group-hover:rotate-180" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch space-y-1">
        <label className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bác sĩ / mã ca / ghi chú…"
            className={inputCls}
          />
        </label>

        <SelectMenu
          value={doctorId}
          onChange={(v) => {
            if (v !== "") setDoctorId(v); // tránh lỗi type "" từ SelectMenu
          }}
          options={options}
          placeholder="Chọn bác sĩ"
          className="min-w-[250px]"
        />

        <button
          onClick={openCreate}
          className="cursor-pointer mt-1 h-12 px-3 inline-flex items-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white"
        >
          <Plus className="w-4 h-4" />
          Thêm ca
        </button>
      </div>
    </div>
  );
};
