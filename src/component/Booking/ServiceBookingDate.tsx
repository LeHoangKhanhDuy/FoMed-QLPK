import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { ServiceInfoCard } from "./ServiceInfoCard";
import { Link } from "react-router-dom";

export type ServiceInfo = {
  name: string;
  address: string;
  specialty: string;
  facilityName: string;
  verified?: boolean;
};

interface Props {
  service: ServiceInfo;
  onSelect?: (dateOrDateTime: Date) => void;
  /** callback khi chọn giờ (nếu truyền sẽ được ưu tiên gọi) */
  onSelectTime?: (dateTime: Date) => void;
  minDate?: Date;
  defaultValue?: Date;
  /** cấu hình slot */
  startHour?: number; // default 6
  endHour?: number; // default 18
  stepMinutes?: number; // default 60

  /** Resolver ngày lễ Âm/Dương: trả về tên ngày lễ nếu là ngày nghỉ, ngược lại null.
   *  ƯU TIÊN: nếu truyền prop này, component sẽ dùng kèm với bộ Dương lịch mặc định bên dưới.
   *  Ví dụ: return "Tết Âm lịch" cho mùng 1-6 Tết, "Giỗ Tổ Hùng Vương" cho 10/3 Âm, ...
   */
  holidayResolver?: (d: Date) => string | null;
}

// Thứ Hai -> Chủ nhật
const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/** Các ngày lễ DƯƠNG lịch cố định (VN) */
function getSolarHolidayName(d: Date): string | null {
  const m = d.getMonth() + 1; // 1..12
  const day = d.getDate();
  if (m === 1 && day === 1) return "Tết Dương lịch";
  if (m === 4 && day === 30) return "Ngày Chiến thắng 30/4";
  if (m === 5 && day === 1) return "Quốc tế Lao động 1/5";
  if (m === 9 && day === 1) return "Quốc khánh 2/9";
  if (m === 9 && day === 2) return "Quốc khánh 2/9";

  return null;
}

export default function BookingDate({
  service,
  onSelect,
  onSelectTime,
  minDate,
  defaultValue,
  startHour = 6,
  endHour = 18,
  stepMinutes = 60,
  holidayResolver, // optional: để bạn map Tết Âm, Giỗ Tổ theo năm
}: Props) {
  const now = new Date();
  const today = startOfDay(new Date());
  const min = startOfDay(minDate ?? today);

  const [current, setCurrent] = useState<Date>(
    defaultValue ? new Date(defaultValue) : today
  );
  const [selected, setSelected] = useState<Date | null>(
    defaultValue ? startOfDay(defaultValue) : null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { year, month } = useMemo(
    () => ({ year: current.getFullYear(), month: current.getMonth() }),
    [current]
  );

  /** Grid CHỈ HIỂN THỊ ngày trong tháng hiện tại.
   *  Những ô trước ngày 1 và sau ngày cuối tháng sẽ render rỗng (placeholder), không phải ngày của tháng sau.
   *  Tuần bắt đầu từ Thứ Hai.
   */
  const grid = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const nativeFirstDow = firstOfMonth.getDay(); // 0=Sun..6=Sat
    const firstWeekdayMon = (nativeFirstDow + 6) % 7; // 0=Mon..6=Sun
    const dim = daysInMonth(year, month);

    // tổng ô = số placeholder trước ngày 1 + số ngày trong tháng + placeholder cuối để đủ bội số 7 (tối đa 6 tuần)
    const totalCells = Math.ceil((firstWeekdayMon + dim) / 7) * 7;

    const cells: {
      date: Date | null; // null = ô trống (không thuộc tháng)
      inMonth: boolean;
    }[] = [];

    for (let i = 0; i < totalCells; i++) {
      if (i < firstWeekdayMon) {
        // Ô trống trước ngày 1
        cells.push({ date: null, inMonth: false });
      } else if (i >= firstWeekdayMon && i < firstWeekdayMon + dim) {
        // Ngày trong tháng
        const day = i - firstWeekdayMon + 1;
        const cellDate = new Date(year, month, day);
        cells.push({ date: cellDate, inMonth: true });
      } else {
        // Ô trống sau ngày cuối
        cells.push({ date: null, inMonth: false });
      }
    }
    return cells;
  }, [year, month]);

  // Tạo danh sách slot giờ (ví dụ 6:00 -> 18:00, mỗi 60')
  const timeSlots = useMemo(() => {
    const list: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        if (h === endHour && m > 0) break; // không vượt quá endHour
        list.push(`${pad2(h)}:${pad2(m)}`);
      }
    }
    return list;
  }, [startHour, endHour, stepMinutes]);

  const goPrev = () =>
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () =>
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handlePick = (d: Date) => {
    const sd = startOfDay(d);
    setSelected(sd);
    setSelectedTime(null); // reset giờ khi đổi ngày
  };

  const handlePickTime = (time: string) => {
    if (!selected) return;
    setSelectedTime(time);
    const [hh, mm] = time.split(":").map(Number);
    const dt = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
      hh,
      mm,
      0,
      0
    );
    if (onSelectTime) onSelectTime(dt);
    else onSelect?.(dt);
  };

  const monthLabel = useMemo(() => {
    const m = (month + 1).toString().padStart(2, "0");
    return `THÁNG ${m} - ${year}`;
  }, [month, year]);

  /** Trả về tên ngày lễ nếu là ngày nghỉ */
  const getHolidayName = (d: Date): string | null => {
    // resolver âm lịch (nếu có)
    const lunar = holidayResolver?.(d) ?? null;
    if (lunar) return lunar;
    // dương lịch mặc định
    return getSolarHolidayName(d);
  };

  /** Quyết định disable một ngày (trước min hoặc ngày lễ) */
  const isDateDisabled = (
    d: Date
  ): { disabled: boolean; holidayName: string | null } => {
    const sd = startOfDay(d);
    const holiday = getHolidayName(sd);
    if (holiday) return { disabled: true, holidayName: holiday };
    if (sd < min) return { disabled: true, holidayName: null };
    return { disabled: false, holidayName: null };
  };

  const nowTs = now.getTime();
  const isSlotDisabled = (slot: string) => {
    if (!selected) return true;
    // nếu là hôm nay: disable các giờ đã qua
    if (sameDay(selected, today)) {
      const [hh, mm] = slot.split(":").map((x) => parseInt(x, 10));
      const slotDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        hh,
        mm,
        0,
        0
      );
      return slotDate.getTime() <= nowTs;
    }
    // Nếu selected là ngày lễ (phòng hờ), không cho chọn slot
    if (getHolidayName(selected)) return true;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-0 py-4 sm:py-6 min-h-[70vh] lg:min-h-[60vh]">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 font-bold mb-6">
        <Link to="/" className="hover:underline cursor-pointer">
          <Home size={18} />
        </Link>
        <span>›</span>
        <span className="hover:underline cursor-pointer">
          {service.facilityName}
        </span>
        <span>›</span>
        <Link to="/booking-doctor" className="text-slate-700">
          Chọn bác sĩ
        </Link>
        <span>›</span>
        <span className="text-sky-400">Chọn ngày khám</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
        {/* LEFT: Thông tin dịch vụ */}
        <ServiceInfoCard
          service={{
            name: "Gói khám sức khỏe tổng quát",
            price: 200000,
            discountPrice: 150000,
            specialty: "Khoa Nội tổng quát",
            verified: true,
          }}
        />

        {/* RIGHT: Lịch chọn ngày */}
        <section className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <header className="relative px-4 py-3 bg-sky-400 text-white">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-pointer"
            >
              <ChevronLeft />
            </button>
            <h2 className="font-semibold text-center text-base sm:text-lg">
              Chọn ngày khám
            </h2>
          </header>

          {/* Header tháng */}
          <div className="flex items-center justify-center gap-3 py-3">
            <button
              type="button"
              onClick={goPrev}
              className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sky-500 font-semibold select-none">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={goNext}
              className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              aria-label="Tháng sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Grid ngày */}
          <div className="px-3 pb-3">
            {/* tiêu đề thứ (T2 -> CN) */}
            <div className="grid grid-cols-7 text-center text-md font-bold border-t border-slate-200">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-2">
                  {w}
                </div>
              ))}
            </div>

            {/* cells: chỉ render ngày của tháng, ô trống là placeholder */}
            <div className="grid grid-cols-7 border-t border-slate-100">
              {grid.map((c, i) => {
                if (!c.inMonth || !c.date) {
                  // Ô trống (không thuộc tháng này)
                  return (
                    <div
                      key={`empty-${i}`}
                      className="h-16 sm:h-20 border-r border-b border-slate-100 bg-white"
                      aria-hidden
                    />
                  );
                }

                const d = c.date;
                const { disabled, holidayName } = isDateDisabled(d);
                const isToday = sameDay(d, startOfDay(new Date()));
                const isSelected = selected ? sameDay(d, selected) : false;

                const base =
                  "relative h-16 sm:h-20 flex items-center justify-center border-r border-b border-slate-100 text-slate-900";
                const stateCls = disabled
                  ? "bg-white opacity-40 cursor-not-allowed"
                  : isToday
                  ? "bg-sky-400 text-white cursor-pointer"
                  : isSelected
                  ? "bg-sky-100 cursor-pointer"
                  : "bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer";

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePick(d)}
                    className={[base, stateCls].join(" ")}
                    aria-label={d.toLocaleDateString("vi-VN")}
                  >
                    <div className="leading-tight">
                      <div className="font-bold">
                        {d.getDate().toString().padStart(2, "0")}
                      </div>
                      {holidayName && (
                        <div className="mt-0.5 text-[10px] text-red-500 font-medium">
                          {holidayName}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIMESLOTS */}
          {selected && !getHolidayName(selected) && (
            <div className="border-t border-slate-200 px-3 pt-4 pb-5">
              <div className="mb-2 flex items-center justify-center gap-3 flex-wrap">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  Chọn thời gian
                  <span className="text-sky-500">
                    {pad2(selected.getDate())}/{pad2(selected.getMonth() + 1)}/
                    {selected.getFullYear()}
                  </span>
                </h3>
                {selectedTime && (
                  <span className="text-sm text-slate-600">
                    Đã chọn: <strong>{selectedTime}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {timeSlots.map((t) => {
                  const isDisabled = isSlotDisabled(t);
                  const isActive = selectedTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handlePickTime(t)}
                      className={[
                        "px-3 py-2 rounded-lg text-sm border transition cursor-pointer",
                        isDisabled
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-sky-400 hover:text-white active:bg-slate-100",
                        isActive
                          ? "bg-sky-500 text-white border-sky-500"
                          : "bg-white text-slate-900 border-slate-200",
                      ].join(" ")}
                      aria-label={`Khung giờ ${t}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
