// src/component/Booking/ServicePackageSelect.tsx
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ClipboardList, ClockIcon, Home, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getService } from "../../services/service";
import { apiGetDoctorDetail } from "../../services/doctorMApi";
import type { ServiceItem } from "../../types/serviceType/service";
import { ServiceInfoCard } from "./ServiceInfoCard";

type Doctor = {
  id: number;
  name: string;
  experience: string;
  specialty?: string;
  verified?: boolean;
};

const formatVND = (n: number) =>
  n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

export default function ServicePackageSelect() {
  const [search] = useSearchParams();
  const doctorId = Number(search.get("doctorId")); // từ URL
  const { state } = useLocation() as { state?: { doctor?: Doctor } };
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(state?.doctor ?? null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch doctor info và services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Load doctor info nếu chưa có
        if (!doctor && doctorId) {
          const doctorData = await apiGetDoctorDetail(doctorId);
          setDoctor({
            id: doctorData.doctorId,
            name: doctorData.fullName,
            experience: doctorData.experienceYears
              ? `+${doctorData.experienceYears} năm kinh nghiệm`
              : "Kinh nghiệm chuyên môn",
            specialty: doctorData.primarySpecialtyName || undefined,
            verified: true,
          });
        }

        // 2. Load danh sách dịch vụ
        const servicesRes = await getService({
          page: 1,
          pageSize: 100,
          isActive: true,
        });
        
        setServices(servicesRes.data.items);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải danh sách dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId, doctor]);

  // Tính toán pagination
  const totalPages = Math.max(1, Math.ceil(services.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  // Reset về trang 1 khi services thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [services.length]);

  const handleContinue = () => {
    if (!selectedId || !doctorId) return;
    
    // Navigate sang trang chọn ngày với serviceId và doctorId
    navigate(
      `/booking-doctor/booking-date?serviceId=${selectedId}&doctorId=${doctorId}`,
      {
        state: { doctor, serviceId: selectedId },
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-0 py-4 sm:py-6 min-h-[70vh] lg:min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-0 py-4 sm:py-6 min-h-[70vh] lg:min-h-[60vh]">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 font-bold mb-6">
        <Link to="/" className="hover:underline cursor-pointer">
          <Home size={18} />
        </Link>
        <span>›</span>
        {doctor && (
          <>
            <Link to={`/user/doctor/${doctor.id}`} className="hover:underline cursor-pointer">
              {doctor.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-sky-500">Chọn dịch vụ</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* LEFT: ServiceInfoCard */}
        {selectedId ? (
          (() => {
            const selectedService = services.find((s) => s.serviceId === selectedId);
            if (!selectedService) return null;
            
            return (
              <ServiceInfoCard
                service={{
                  name: selectedService.name,
                  price: selectedService.basePrice || 0,
                  specialty: selectedService.category?.name || "Chuyên khoa tổng hợp",
                  verified: selectedService.isActive,
                  durationMin: selectedService.durationMin,
                }}
                selectedDoctor={doctor ? {
                  name: doctor.name,
                  specialty: doctor.specialty || "Chuyên khoa tổng hợp",
                } : undefined}
              />
            );
          })()
        ) : (
          <aside className="md:col-span-1 md:sticky md:top-20 md:self-start rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <header className="px-4 py-3 bg-sky-400">
              <h2 className="font-semibold text-center text-white text-base sm:text-lg">
                Thông tin đặt khám
              </h2>
            </header>
            <div className="p-4 space-y-3 text-sm">
              {doctor && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-slate-500 mb-1">Bác sĩ</p>
                  <p className="text-lg font-semibold">{doctor.name}</p>
                  <p className="text-slate-600 mt-1">{doctor.experience}</p>
                  {doctor.specialty && (
                    <p className="text-sky-600 text-sm mt-1">
                      📋 {doctor.specialty}
                    </p>
                  )}
                </div>
              )}
              <div className="text-center text-slate-400 text-sm py-2">
                Vui lòng chọn dịch vụ
              </div>
            </div>
          </aside>
        )}

        {/* RIGHT: danh sách gói */}
        <section className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <header className="px-4 py-3 bg-sky-400 text-white">
            <h2 className="font-semibold text-center text-base sm:text-lg">
              Chọn gói dịch vụ
            </h2>
          </header>

          <div className="p-4 sm:p-5 space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Không có dịch vụ nào
              </div>
            ) : (
              currentServices.map((service) => (
                <label
                  key={service.serviceId}
                  className={[
                    "flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 border rounded-xl hover:border-sky-400 transition cursor-pointer",
                    selectedId === service.serviceId
                      ? "border-sky-500 ring-1 ring-sky-200"
                      : "border-slate-200",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="service"
                    className="mt-1 cursor-pointer"
                    checked={selectedId === service.serviceId}
                    onChange={() => setSelectedId(service.serviceId)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{service.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-red-500 text-lg font-bold">
                          {service.basePrice ? formatVND(service.basePrice) : "Liên hệ"}
                        </p>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-sm text-slate-600 mt-2">{service.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {service.durationMin && (
                        <span className="flex items-center gap-2 text-sm px-2 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                          <ClockIcon className="w-4 h-4 text-sky-400"/> {service.durationMin} phút
                        </span>
                      )}
                      {service.category?.name && (
                        <span className="flex items-center gap-2 text-sm px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700">
                          <ClipboardList className="w-4 h-4 text-green-400"/>{service.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))
            )}

            {/* Pagination */}
            {services.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-slate-500">
                  Trang {currentPage} / {totalPages} • {services.length} dịch vụ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm cursor-pointer"
              >
                Quay lại
              </button>
              <button
                disabled={!selectedId}
                onClick={handleContinue}
                className={[
                  "px-4 py-2 rounded-[var(--rounded)] text-white text-sm shadow-sm",
                  selectedId
                    ? "bg-primary-linear cursor-pointer"
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
