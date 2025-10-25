import { Link } from "react-router-dom";
import check from "../../assets/images/checklist.png";
import { useMemo, useState, useEffect } from "react";
import { ServiceInfoCard } from "./ServiceInfoCard";
import hospital from "../../assets/images/hospital.png";
import schedule from "../../assets/images/schedule.png";
import { Home } from "lucide-react";

type ServiceInfo = {
  name: string;
  price: number;
  discountPrice?: number;
  specialty: string;
  verified?: boolean;
};

type Doctor = {
  id: number;
  name: string;
  note?: string;
  experience: string;
  specialty: string;
  verified?: boolean;
};

interface Props {
  service: ServiceInfo;
  doctors: Doctor[];
  selectedDoctorId?: number | null;
  onDetail?: (id: number) => void;
  onBook?: (id: number) => void;
  onSelectDoctor?: (doctor: Doctor) => void;
}

export default function ServiceBookingDoctor({
  service,
  doctors,
  selectedDoctorId,
  onDetail,
  onBook,
  onSelectDoctor,
}: Props) {
  
  const selectedDoctor = selectedDoctorId 
    ? doctors.find(d => d.id === selectedDoctorId) 
    : null;
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.max(1, Math.ceil(doctors.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const currentDoctors = doctors.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    const next = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(next);
  };

  const pageItems = useMemo<(number | "...")[]>(() => {
    const items: (number | "...")[] = [];
    const push = (v: number | "...") => items.push(v);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) push(i);
      return items;
    }

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    push(1);
    if (left > 2) push("...");
    for (let i = left; i <= right; i++) push(i);
    if (right < totalPages - 1) push("...");
    push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-0 py-4 sm:py-6 min-h-[70vh] lg:min-h-[60vh]">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 font-bold mb-6">
        <Link to="/" className="hover:underline cursor-pointer">
          <Home size={18} />
        </Link>
        <span>›</span>
        <Link to="/booking-packages" className="hover:underline cursor-pointer">
          Đặt gói khám
        </Link>
        <span>›</span>
        <span className="text-sky-400">Chọn bác sĩ</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* LEFT: Thông tin dịch vụ */}
        <ServiceInfoCard 
          service={service} 
          selectedDoctor={selectedDoctor ? {
            name: selectedDoctor.name,
            specialty: selectedDoctor.specialty
          } : undefined}
        />

        {/* RIGHT: Chọn bác sĩ */}
        <section className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <header className="px-4 py-3 bg-sky-400 text-white">
            <h2
              id="doctor-list-top"
              className="font-semibold text-center text-base sm:text-lg"
            >
              Chọn bác sĩ
            </h2>
          </header>

          {doctors.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Hiện chưa có bác sĩ nào khả dụng cho dịch vụ này.
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden space-y-3">
                {currentDoctors.map((d, idx) => (
                  <div key={d.id} className="bg-white border-b p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-md text-slate-500">
                          #{startIndex + idx + 1}
                        </div>
                        <p className="flex items-center gap-2 mt-0.5 text-lg font-semibold text-slate-900">
                          {d.name}
                          {d.verified && (
                            <img
                              src={check}
                              alt="Đã xác minh"
                              className="w-4 h-4"
                            />
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <img src={hospital} alt="" className="w-5 h-5" />
                      <div className="text-sm leading-5">{d.experience}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <div className="text-sm leading-5 font-medium text-sky-600">{d.specialty}</div>
                    </div>
                    {d.note && (
                      <div className="flex items-center gap-2">
                        <img src={schedule} alt="" className="w-5 h-5" />
                        <p className="text-sm leading-5">{d.note}</p>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onDetail?.(d.id)}
                        className="px-3 py-2 rounded-[var(--rounded)] border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50 cursor-pointer"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => {
                          onSelectDoctor?.(d);
                          onBook?.(d.id);
                        }}
                        className={`px-3 py-2 rounded-[var(--rounded)] text-center text-white text-sm shadow-sm cursor-pointer ${
                          selectedDoctorId === d.id
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-primary-linear hover:bg-sky-700'
                        }`}
                      >
                        {selectedDoctorId === d.id ? '✓ Đã chọn' : 'Đặt khám'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Tên bác sĩ
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Kinh nghiệm
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Chuyên khoa
                      </th>
                      <th className="flex justify-center px-4 py-3 text-center font-medium">
                        Chức năng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentDoctors.map((d, idx) => (
                      <tr key={d.id}>
                        <td className="px-4 py-3 text-slate-600">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold">{d.name}</p>
                            {d.verified && (
                              <img
                                src={check}
                                alt="Đã xác minh"
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                          {d.note && (
                            <p className="text-sm text-slate-600 mt-1">
                              {d.note}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{d.experience}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{d.specialty}</div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex flex-col md:flex-row gap-2 justify-center">
                            <button
                              onClick={() => onDetail?.(d.id)}
                              className="px-3 py-2 rounded-[var(--rounded)] border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm cursor-pointer"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                onSelectDoctor?.(d);
                                onBook?.(d.id);
                              }}
                              className={`px-3 py-2 rounded-[var(--rounded)] text-white text-sm cursor-pointer ${
                                selectedDoctorId === d.id
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-primary-linear hover:bg-sky-700'
                              }`}
                            >
                              {selectedDoctorId === d.id ? '✓ Đã chọn' : 'Đặt khám'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                  <p className="font-semibold px-4 text-black">
                    Trang{" "}
                    <span className="font-semibold text-black">
                      {currentPage}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-black">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center px-4 xl:px-10 gap-2">
                    {pageItems.map((it, idx) =>
                      it === "..." ? (
                        <span
                          key={`e-${idx}`}
                          className="px-2 text-slate-400 select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={it}
                          onClick={() => handlePageChange(it as number)}
                          aria-current={it === currentPage ? "page" : undefined}
                          className={[
                            "w-8 h-8 rounded-full border flex items-center justify-center text-sm transition cursor-pointer",
                            it === currentPage
                              ? "bg-sky-400 text-white"
                              : "bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:text-sky-600",
                          ].join(" ")}
                        >
                          {it}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
