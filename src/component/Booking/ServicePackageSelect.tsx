// src/component/Booking/ServicePackageSelect.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Home } from "lucide-react";

type Doctor = {
  id: number;
  name: string;
  experience: string;
  verified?: boolean;
};

type PackageItem = {
  id: number;
  name: string;
  desc?: string;
  price: number;
  oldPrice?: number;
  duration?: string; // ví dụ "45-60 phút"
  highlights?: string[];
};

const formatVND = (n: number) =>
  n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function ServicePackageSelect() {
  const [search] = useSearchParams();
  const doctorId = Number(search.get("doctorId")); // từ bước trước
  const { state } = useLocation() as { state?: { doctor?: Doctor } };
  const navigate = useNavigate();

  // Nếu đã được truyền từ bước trước thì dùng luôn, nếu không thì gọi API theo doctorId
  const [doctor, setDoctor] = useState<Doctor | null>(state?.doctor ?? null);

  useEffect(() => {
    if (!doctor && doctorId) {
      // TODO: gọi API lấy info bác sĩ theo doctorId
      // demo:
      setDoctor({
        id: doctorId,
        name: "TS.BS Nguyễn Văn A",
        experience: "+20 năm kinh nghiệm",
        verified: true,
      });
    }
  }, [doctor, doctorId]);

  // Gói demo (thực tế lấy từ API theo doctorId / facilityId)
  const packages = useMemo<PackageItem[]>(
    () => [
      {
        id: 101,
        name: "Gói khám tổng quát cơ bản",
        desc: "Khám, tư vấn nội tổng quát, các chỉ số nền.",
        price: 150_000,
        oldPrice: 200_000,
        duration: "45 phút",
        highlights: ["Khám nội", "Đo huyết áp", "Xét nghiệm cơ bản"],
      },
      {
        id: 102,
        name: "Gói tổng quát nâng cao",
        desc: "Mở rộng danh mục xét nghiệm và chẩn đoán hình ảnh.",
        price: 350_000,
        oldPrice: 420_000,
        duration: "60 phút",
        highlights: [
          "Khám chuyên sâu",
          "Xét nghiệm nâng cao",
          "Siêu âm ổ bụng",
        ],
      },
      {
        id: 103,
        name: "Gói tim mạch chuyên sâu",
        desc: "Tập trung sàng lọc và tư vấn bệnh lý tim mạch.",
        price: 490_000,
        duration: "60 phút",
        highlights: ["Điện tim", "Siêu âm tim", "Tư vấn chuyên khoa"],
      },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleContinue = () => {
    if (!selectedId) return;
    navigate(
      `/booking-doctor/booking-date?doctorId=${doctorId}&packageId=${selectedId}`,
      {
        state: { doctor, packageId: selectedId },
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-0 py-4 sm:py-6 min-h-[70vh] lg:min-h-[60vh]">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 font-bold mb-6">
        <Link to="/" className="hover:underline cursor-pointer">
          <Home size={18} />
        </Link>
        <span>›</span>
        <Link to="/booking-doctor" className="hover:underline cursor-pointer">
          Chọn bác sĩ
        </Link>
        <span>›</span>
        <span className="text-sky-500">Chọn gói</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* LEFT: bác sĩ + CSYT */}
        <aside className="md:col-span-1 md:sticky md:top-20 md:self-start rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <header className="px-4 py-3 bg-sky-400">
            <h2 className="font-semibold text-center text-white text-base sm:text-lg">
              Thông tin
            </h2>
          </header>
          <div className="p-4 space-y-3 text-sm">
            {doctor && (
              <div className="border rounded-lg p-3">
                <p className="text-xs sm:text-sm text-slate-500 mb-1">Bác sĩ</p>
                <p className="text-lg font-semibold">{doctor.name}</p>
                <p className="text-slate-600 mt-1">{doctor.experience}</p>
              </div>
            )}
            {selectedId && (
              <div className="border rounded-lg p-3">
                <p className="text-xs sm:text-sm text-slate-500 mb-1">Gói đã chọn</p>
                <p className="text-lg font-semibold">
                  {packages.find((p) => p.id === selectedId)?.name}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: danh sách gói */}
        <section className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <header className="px-4 py-3 bg-sky-400 text-white">
            <h2 className="font-semibold text-center text-base sm:text-lg">
              Chọn gói dịch vụ
            </h2>
          </header>

          <div className="p-4 sm:p-5 space-y-4">
            {packages.map((pkg) => (
              <label
                key={pkg.id}
                className={[
                  "flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 border rounded-xl hover:border-sky-400 transition cursor-pointer",
                  selectedId === pkg.id
                    ? "border-sky-500 ring-1 ring-sky-200"
                    : "border-slate-200",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="pkg"
                  className="mt-1 cursor-pointer"
                  checked={selectedId === pkg.id}
                  onChange={() => setSelectedId(pkg.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                    <div className="text-right">
                      {pkg.oldPrice && (
                        <p className="text-sm line-through text-slate-400">
                          {formatVND(pkg.oldPrice)}
                        </p>
                      )}
                      <p className="text-red-500 text-lg font-bold">{formatVND(pkg.price)}</p>
                    </div>
                  </div>
                  {pkg.desc && (
                    <p className="text-sm text-slate-600">{pkg.desc}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {pkg.duration && (
                      <span className="text-xs px-2 py-1 rounded-full border border-slate-200">
                        Thời lượng: {pkg.duration}
                      </span>
                    )}
                    {pkg.highlights?.map((h, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full border border-slate-200"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            ))}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/booking-doctor"
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm cursor-pointer"
              >
                Quay lại
              </Link>
              <button
                disabled={!selectedId}
                onClick={handleContinue}
                className={[
                  "px-4 py-2 rounded-lg text-white text-sm shadow-sm cursor-pointer",
                  selectedId
                    ? "bg-primary-linear"
                    : "bg-slate-300 cursor-not-allowed",
                ].join(" ")}
              >
                Tiếp tục chọn ngày
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
