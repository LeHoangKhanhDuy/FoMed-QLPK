import { Link } from "react-router-dom";
import {
  CalendarClock,
  Hospital,
  MapPin,
  Star,
  Stethoscope,
} from "lucide-react";

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

export default function DoctorProfile({ doctor }: { doctor: Doctor }) {
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
            <div className="md:col-span-8">
              <h1 className="mb-4 text-2xl font-bold text-sky-500">
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
          </div>
        </div>

        {/* Thanh dưới */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-sky-50 px-4 sm:px-6 py-4">
          <button className="h-10 px-5 rounded-[var(--rounded)] bg-primary-linear text-white font-semibold shadow-sm cursor-pointer">
            Đặt lịch
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
          <h2 className="mb-4 text-2xl font-bold text-sky-500">Giới thiệu</h2>
          <p>
            Bác sĩ Lê Hoàng Thiên tốt nghiệp{" "}
            <b>Thạc sĩ y khoa chuyên ngành nội khoa</b> tại Đại học Y Dược
            TP.HCM và <b>tốt nghiệp loại giỏi chuyên ngành nội soi tiêu hóa</b>{" "}
            tại Đại học Y Dược Cần Thơ.
          </p>
          <p className="mt-3">
            Bác sĩ có <b>nhiều năm kinh nghiệm</b> trong công tác khám chữa bệnh
            chuyên ngành nội khoa và lão khoa; có nhiều bài nghiên cứu được công
            bố trong và ngoài nước.
          </p>
        </div>

        <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
          <h2 className="mb-4 text-2xl font-bold text-sky-500">Học vấn</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <b>2013 – 2019:</b> Sinh viên Y đa khoa
            </li>
            <li>
              <b>2019 – 2020:</b> Học nội soi tiêu hoá BV Đại học Y Dược Cần Thơ
            </li>
            <li>
              <b>2021:</b> Chứng chỉ Điện tâm đồ – Trường ĐH Y khoa Phạm Ngọc
              Thạch
            </li>
            <li>
              <b>2020 – 2022:</b> Thạc sĩ Nội khoa – ĐH Y Dược TP.HCM
            </li>
            <li>
              <b>2022:</b> Chứng chỉ Siêu âm tim & bệnh lý tim mạch – Viện Tim
              TP.HCM
            </li>
          </ul>
        </div>

        <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
          <h2 className="mb-4 text-2xl font-bold text-sky-500">Chuyên môn</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <b>2022:</b> Bằng khen của ĐH Y Dược TP.HCM
            </li>
            <li>
              <b>5/2022:</b> Đánh giá lão khoa toàn diện và tình trạng hậu nhiễm
              COVID-19
            </li>
            <li>
              <b>10/2022:</b> Nghiên cứu bệnh nhân COVID-19 nặng
            </li>
            <li>
              Nghiên cứu tình trạng té ngã ở người cao tuổi đã nhiễm COVID-19
            </li>
          </ul>
        </div>

        <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
          <h2 className="mb-4 text-2xl font-bold text-sky-500">Thành tựu</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <b>2022:</b> Bằng khen của ĐH Y Dược TP.HCM
            </li>
            <li>
              <b>5/2022:</b> Đánh giá lão khoa toàn diện và tình trạng hậu nhiễm
              COVID-19
            </li>
            <li>
              <b>10/2022:</b> Nghiên cứu bệnh nhân COVID-19 nặng
            </li>
            <li>
              Nghiên cứu tình trạng té ngã ở người cao tuổi đã nhiễm COVID-19
            </li>
          </ul>
        </div>
      </div>
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
