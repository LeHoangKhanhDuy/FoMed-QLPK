import React, { useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Shift, ScheduleStatus } from "../../../types/schedule/types";
import { isSameDay, toYMD } from "../../../types/schedule/date";
import ConfirmModal from "../../../common/ConfirmModal";

type Props = {
  days: string[]; // YYYY-MM-DD[] - chỉ lấy 5 ngày đầu (Mon-Fri)
  shifts: Shift[];
  onEdit: (s: Shift) => void;
  onDelete: (id: number) => void;
};

// Helper: chuyển HH:mm sang phút
const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Helper: chuyển phút sang format "8h", "9h", ... "18h"
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
};

// Màu sắc cho các status
const STATUS_COLORS: Record<ScheduleStatus, string> = {
  scheduled: "bg-blue-100 border-blue-300 text-blue-700",
  working: "bg-green-100 border-green-300 text-green-700",
  cancelled: "bg-red-100 border-red-300 text-red-700",
};

export const WeekGrid: React.FC<Props> = ({
  days,
  shifts,
  onEdit,
  onDelete,
}) => {
  // Chỉ lấy 5 ngày đầu (Mon-Fri) cho work week
  const workDays = days.slice(0, 5);

  // Time slots từ 8:00 AM đến 6:00 PM (mỗi giờ một slot)
  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    for (let h = 8; h <= 18; h++) {
      slots.push(h * 60); // minutes since midnight
    }
    return slots;
  }, []);

  // Tính toán vị trí và kích thước event block (tính bằng pixel)
  const getEventPosition = (shift: Shift) => {
    const startMin = toMinutes(shift.start);
    const endMin = toMinutes(shift.end);
    const slotHeight = 64; // mỗi slot = 64px
    const startOffset = 480; // 8:00 AM = 480 minutes
    
    // Tính top position: từ start time đến 8:00 AM
    const topPx = ((startMin - startOffset) / 60) * slotHeight;
    
    // Tính height: duration của shift
    const heightPx = ((endMin - startMin) / 60) * slotHeight;

    return {
      top: `${Math.max(0, topPx)}px`,
      height: `${Math.max(20, heightPx)}px`, // min 20px
    };
  };

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    workDays.forEach((d) => {
      map.set(d, shifts.filter((s) => s.date === d));
    });
    return map;
  }, [shifts, workDays]);

  const [confirmDelete, setConfirmDelete] = React.useState<{
    open: boolean;
    shiftId: number | null;
  }>({ open: false, shiftId: null });

  const handleDeleteClick = (shiftId: number) => {
    setConfirmDelete({ open: true, shiftId });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.shiftId) {
      onDelete(confirmDelete.shiftId);
      setConfirmDelete({ open: false, shiftId: null });
    }
  };

  const totalHeight = timeSlots.length * 64;

  return (
    <div className="relative border rounded-lg bg-white">
      {/* Calendar Grid với scroll */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
        <div className="flex min-w-[800px]">
          {/* Time Column - sticky */}
          <div className="flex-shrink-0 w-20 border-r bg-gray-50 sticky left-0 z-10">
            <div className="h-12 border-b bg-sky-500"></div>
            <div style={{ height: `${totalHeight}px` }}>
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="h-16 border-b border-gray-200 flex items-center pt-1 pr-2 justify-center text-xs font-semibold text-white bg-sky-500"
                  style={{ height: "64px" }}
                >
                  {formatTime(slot)}
                </div>
              ))}
            </div>
          </div>

          {/* Days Columns */}
          <div className="flex-1 grid grid-cols-5">
            {workDays.map((day, dayIdx) => {
              const dayShifts = shiftsByDate.get(day) || [];
              const isToday = isSameDay(day, toYMD(new Date()));
              // Work week: T2, T3, T4, T5, T6 (Mon-Fri)
              const dayNames = ["T2", "T3", "T4", "T5", "T6"];
              const dayName = dayNames[dayIdx]; // workDays đã là Mon-Fri rồi
              const dayNum = day.split("-")[2];

              return (
                <div key={day} className="border-r relative">
                  {/* Day Header - sticky */}
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

                  {/* Time Slots Container */}
                  <div 
                    className="relative"
                    style={{ height: `${totalHeight}px` }}
                  >
                    {/* Grid lines */}
                    {timeSlots.map((slot, idx) => (
                      <div
                        key={slot}
                        className="absolute w-full border-b border-gray-200 pointer-events-none"
                        style={{ top: `${idx * 64}px` }}
                      />
                    ))}

                    {/* Event Blocks */}
                    {dayShifts.map((shift) => {
                      const pos = getEventPosition(shift);
                      const colorClass = STATUS_COLORS[shift.status];

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
                          <div className="text-xs font-semibold truncate">
                            {shift.doctorName}
                          </div>
                          <div className="text-xs mt-0.5">
                            {shift.start} - {shift.end}
                          </div>
                          {shift.location && (
                            <div className="text-xs mt-0.5 opacity-75 truncate">
                              {shift.location}
                            </div>
                          )}
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(shift);
                              }}
                              className="p-0.5 rounded hover:bg-white/50"
                              title="Sửa"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(shift.id);
                              }}
                              className="p-0.5 rounded hover:bg-white/50"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
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

      {/* Confirm Delete Modal */}
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