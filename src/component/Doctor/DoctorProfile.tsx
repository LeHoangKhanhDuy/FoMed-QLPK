import { Link } from "react-router-dom";
import {
  CalendarClock,
  Hospital,
  MapPin,
  Star,
  Stethoscope,
} from "lucide-react";
import { DoctorIntroduce } from "./DoctorIntroduce";
import DoctorRelated from "./DoctorRelated";
import type { DoctorCardProps } from "../Card/DoctorCard";

type Doctor = {
  id: number;
  name: string;
  degree?: string;
  avatar: string;
  specialty: string;
  experience: string;
  schedule_type?: string;
  visitCount: number;
  star: number; // ví dụ: 4.5
};

/* ⭐ RatingStars: tính số sao full/half/empty từ điểm 0..5 */
// ngay trong DoctorProfileCard.tsx
function RatingStars({ value, size = 18 }: { value: number; size?: number }) {
  const rating = Math.max(0, Math.min(5, value ?? 0));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Đánh giá ${rating}/5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        // phần được tô của sao thứ i (0..1)
        const fill = Math.max(0, Math.min(1, rating - i));
        const percent = fill * 100;

        return (
          <div
            key={i}
            className="relative"
            style={{ width: size, height: size }}
          >
            {/* Lớp dưới: sao viền xám (giữ border cho phần chưa tô) */}
            <Star
              className="absolute inset-0 text-slate-300"
              style={{ width: size, height: size }}
            />
            {/* Lớp trên: sao vàng, cắt theo % để tạo half/partial */}
            {percent > 0 && (
              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${percent}%` }}
              >
                <Star
                  className="text-amber-400 fill-amber-400"
                  style={{ width: size, height: size }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DoctorProfile({
  doctor,
  relatedDoctors,
}: {
  doctor: Doctor;
  relatedDoctors?: DoctorCardProps[];
}) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-sky-500">
            Trang chủ
          </Link>
          <span>›</span>
          <Link to="/doctors" className="hover:text-sky-500">
            Bác sĩ
          </Link>
          <span>›</span>
          <span className="text-sky-500 font-medium truncate">
            {doctor.degree ? `${doctor.degree} ` : ""}
            {doctor.name}
          </span>
        </div>
      </nav>

      {/* Card */}
      <div className="rounded-[var(--rounded)] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Ảnh */}
            <div className="md:col-span-3 flex justify-center md:justify-start">
              <div className="w-40 h-40 overflow-hidden">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.currentTarget.src = "/fallback-doctor.png")
                  }
                />
              </div>
            </div>

            {/* Thông tin */}
            <div className="md:col-span-7">
              <h1 className="mb-4 text-2xl font-bold text-sky-500 text-center md:text-left">
                {doctor.degree ? `${doctor.degree} ` : ""}
                {doctor.name}
              </h1>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow
                  icon={<Hospital className="w-5 h-5 text-sky-500" />}
                  label="Kinh nghiệm"
                  value={doctor.experience}
                />
                <InfoRow
                  icon={<Stethoscope className="w-5 h-5 text-sky-500" />}
                  label="Chuyên khoa"
                  value={doctor.specialty}
                />
                <InfoRow
                  icon={<CalendarClock className="w-5 h-5 text-sky-500" />}
                  label="Lịch khám"
                  value={doctor.schedule_type ?? "Hẹn khám"}
                />
                <InfoRow
                  icon={<MapPin className="w-5 h-5 text-sky-500" />}
                  label="Lượt khám"
                  value={doctor.visitCount ?? "-"}
                />

                {/* ⭐ Đánh giá: giữ format hàng InfoRow nhưng custom phần value */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-500">Đánh giá:</span>
                  <RatingStars value={doctor.star} />
                  <span className="text-yellow-500 text-sm">
                    ({doctor.star.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
            {/* Cột nút đặt lịch */}
            <div className="md:col-span-2 flex items-start md:items-center justify-center md:justify-end">
              <button
                type="button"
                aria-label="Đặt lịch khám"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--rounded)] 
               bg-primary-linear text-white font-medium shadow-sm cursor-pointer
               whitespace-nowrap leading-none
               transition duration-200 active:scale-95"
              >
                <CalendarClock className="w-4 h-4" />
                <span>Đặt lịch khám</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thanh dưới */}
      </div>

      <DoctorIntroduce />

      <DoctorRelated
        doctors={relatedDoctors} 
        currentDoctorName={doctor.name}
        limit={8}
      />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
