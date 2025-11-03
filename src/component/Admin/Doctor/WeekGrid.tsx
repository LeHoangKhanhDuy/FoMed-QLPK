import React, { useMemo, useState, useCallback } from "react";
import type { Shift, ScheduleStatus } from "../../../types/schedule/types";
import { isSameDay, toYMD } from "../../../types/schedule/date";
import ConfirmModal from "../../../common/ConfirmModal";

type Props = {
  days: string[]; // YYYY-MM-DD[] - 7 ngày trong tuần
  shifts: Shift[];
  loading?: boolean;
  onEdit: (s: Shift) => void;
  onDelete: (id: number) => void;
};

// HH:mm -> minutes
const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// 480 -> "8h"
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
};

const STATUS_COLORS: Record<ScheduleStatus, string> = {
  scheduled: "bg-blue-100 border-blue-300 text-blue-700",
  working: "bg-green-100 border-green-300 text-green-700",
  cancelled: "bg-red-100 border-red-300 text-red-700",
};

export const WeekGrid: React.FC<Props> = ({
  days,
  shifts,
  loading = false,
  onEdit,
  onDelete,
}) => {
  // constant 7 ngày tuần (Mon..Sun) từ props
  const workDays = days;

  // tạo danh sách các mốc giờ (8h -> 18h)
  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    for (let h = 8; h <= 18; h++) {
      slots.push(h * 60);
    }
    return slots;
  }, []);

  // hôm nay dưới dạng YYYY-MM-DD -> memo để không tính lại trong vòng lặp
  const todayYMD = useMemo(() => toYMD(new Date()), []);

  // vị trí/chiều cao block lịch trong cột theo phút
  const getEventPosition = useCallback((shift: Shift) => {
    const startMin = toMinutes(shift.start);
    const endMin = toMinutes(shift.end);
    const slotHeight = 64; // px mỗi giờ
    const startOffset = 480; // 8:00 => 480 phút

    const topPx = ((startMin - startOffset) / 60) * slotHeight;
    const heightPx = ((endMin - startMin) / 60) * slotHeight;

    return {
      top: `${Math.max(0, topPx)}px`,
      height: `${Math.max(20, heightPx)}px`, // tối thiểu 20px
    };
  }, []);

  // =======================
  // TỐI ƯU QUAN TRỌNG NHẤT
  // =======================
  // Group shifts by date chỉ duyệt shifts 1 lần, O(N), thay vì filter N lần
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const d of workDays) {
      map.set(d, []);
    }
    for (const s of shifts) {
      if (!map.has(s.date)) {
        map.set(s.date, [s]);
      } else {
        map.get(s.date)!.push(s);
      }
    }
    return map;
  }, [shifts, workDays]);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    shiftId: number | null;
  }>({ open: false, shiftId: null });

  // const handleDeleteClick = (shiftId: number) => {
  //   setConfirmDelete({ open: true, shiftId });
  // };

  const handleConfirmDelete = () => {
    if (confirmDelete.shiftId != null) {
      onDelete(confirmDelete.shiftId);
      setConfirmDelete({ open: false, shiftId: null });
    }
  };

  const totalHeight = timeSlots.length * 64;
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="relative border rounded-lg bg-white">
      {/* Calendar Grid với scroll */}
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: "600px" }}
      >
        <div className="flex min-w-[800px]">
          {/* Cột giờ (sticky) */}
          <div className="flex-shrink-0 w-20 border-r bg-gray-50 sticky left-0 z-10">
            <div className="h-12 border-b bg-gray-50" />
            <div style={{ height: `${totalHeight}px` }}>
              {timeSlots.map((slotMin) => (
                <div
                  key={slotMin}
                  className="h-16 border-b border-gray-200 flex items-start pt-1 pr-2 justify-end text-xs text-gray-600 bg-gray-50"
                  style={{ height: "64px" }}
                >
                  {formatTime(slotMin)}
                </div>
              ))}
            </div>
          </div>

          {/* Các cột ngày */}
          <div className="flex-1 grid grid-cols-7">
            {workDays.map((day, dayIdx) => {
              const dayShifts = shiftsByDate.get(day) || [];
              const isToday = isSameDay(day, todayYMD);
              const dayName = dayNames[dayIdx] ?? "";
              const dayNum = day.split("-")[2]; // lấy "DD" từ YYYY-MM-DD

              return (
                <div key={day} className="border-r relative">
                  {/* Header ngày (sticky top) */}
                  <div
                    className={`h-12 border-b flex items-center justify-center text-sm font-medium sticky top-0 z-10 ${
                      isToday ? "bg-blue-50 text-blue-700" : "bg-white"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase font-semibold">
                        {dayName}
                      </div>
                      <div className="text-base font-bold">{dayNum}</div>
                    </div>
                  </div>

                  {/* Thân cột với các block ca trực */}
                  <div
                    className="relative"
                    style={{ height: `${totalHeight}px` }}
                  >
                    {/* vạch giờ ngang */}
                    {timeSlots.map((_, idx) => (
                      <div
                        key={idx}
                        className="absolute w-full border-b border-gray-200 pointer-events-none"
                        style={{ top: `${idx * 64}px` }}
                      />
                    ))}

                    {/* các block lịch */}
                    {dayShifts.map((shift) => {
                      const pos = getEventPosition(shift);
                      const colorClass = STATUS_COLORS[shift.status];

                      if (loading) {
                        return (
                          <div
                            key={`sk-${shift.id}`}
                            className="absolute left-1 right-1 rounded bg-slate-200 animate-pulse"
                            style={{
                              top: pos.top,
                              height: pos.height,
                              minHeight: "40px",
                            }}
                          />
                        );
                      }

                      return (
                        <div
                          key={shift.id}
                          className={`absolute left-1 right-1 rounded border p-2 cursor-pointer hover:shadow-md transition-shadow ${colorClass}`}
                          style={{
                            top: pos.top,
                            height: pos.height,
                            minHeight: "40px",
                          }}
                          onClick={() => onEdit(shift)}
                          title={`${shift.doctorName} - ${shift.start} - ${shift.end}`}
                        >
                          <div className="text-xl font-bold truncate">
                            {shift.doctorName}
                          </div>
                          <div className="text-md mt-0.5">
                            {shift.start} - {shift.end}
                          </div>
                          {shift.location && (
                            <div className="text-md truncate">
                              {shift.location}
                            </div>
                          )}

                          {/* Nếu muốn bật lại edit / delete icon trong block:
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(shift);
                              }}
                              className="p-0.5 rounded cursor-pointer"
                              title="Sửa"
                            >
                              <Pencil className="w-6 h-6" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(shift.id);
                              }}
                              className="p-0.5 rounded cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                          */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal xác nhận xoá */}
      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, shiftId: null })}
        onConfirm={handleConfirmDelete}
        loading={false}
        title="Xóa lịch làm việc"
        description="Bạn có chắc muốn xóa lịch làm việc này?"
        confirmText="Xóa"
        cancelText="Hủy"
        danger
      />
    </div>
  );
};
