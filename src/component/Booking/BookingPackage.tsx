import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import clinic from "../../assets/images/clinic.png";
import type { ServiceItem } from "../../types/serviceType/service";
import { getService } from "../../services/service";
import { formatMinutes, formatVND } from "../../Utils/formatVND";

export default function BookingPackages() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra cache trong sessionStorage (cache 5 phút)
        const cacheKey = 'booking_packages_cache';
        const cacheTimeKey = 'booking_packages_cache_time';
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(cacheTimeKey);
        
        const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
        const now = Date.now();
        
        if (cached && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
          // Dùng cache
          setItems(JSON.parse(cached));
          setLoading(false);
          return;
        }
        
        // Fetch từ API - lấy dịch vụ đang hoạt động
        const res = await getService({ page: 1, pageSize: 12, isActive: true });
        // phòng hờ nếu BE chưa lọc
        const onlyActive = (res.data.items ?? []).filter((x) => x.isActive);
        
        setItems(onlyActive);
        
        // Lưu vào cache
        sessionStorage.setItem(cacheKey, JSON.stringify(onlyActive));
        sessionStorage.setItem(cacheTimeKey, now.toString());
      } catch {
        toast.error("Không tải được danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleClick = (serviceId: number) => {
    navigate(`/booking-doctor?serviceId=${serviceId}`);
  };

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
        <h2 className="text-3xl md:text-5xl font-bold text-sky-400 text-center">
          Đặt lịch khám bệnh
        </h2>
        <p className="text-lg text-center text-slate-600 mt-4">
          Các gói/dịch vụ hiện có tại FoMed
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {loading &&
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-white rounded-xl p-3 md:p-5 shadow-md ring-1 ring-slate-100 animate-pulse"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}

          {!loading &&
            items.map((s) => {
              const img =
                s.imageUrl?.trim() || s.category?.imageUrl?.trim() || clinic;
              return (
                <button
                  key={s.serviceId}
                  type="button"
                  onClick={() => handleClick(s.serviceId)}
                  className="w-full bg-white rounded-xl p-3 md:p-5 shadow-md ring-1 ring-slate-100
                         hover:ring-sky-400 hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
                  aria-label={s.name}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="shrink-0 w-16 h-16 md:w-42 md:h-24 rounded-lg bg-sky-50 overflow-hidden ring-1 ring-sky-100">
                      <img
                        src={img}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          ((e.currentTarget as HTMLImageElement).src = clinic)
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-left font-medium text-slate-900 leading-snug">
                        {s.name}
                      </span>
                      {typeof s.basePrice === "number" && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-slate-500">
                            Giá từ:
                          </span>
                          <p className="text-red-500 font-semibold">
                            {formatVND(s.basePrice)}
                          </p>
                        </div>
                      )}
                      {s.durationMin ? (
                        <span className="text-xs text-slate-500">
                          Thời gian khám: {formatMinutes(s.durationMin)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}

          {!loading && items.length === 0 && (
            <div className="col-span-full text-center text-slate-500">
              Chưa có dịch vụ nào.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
