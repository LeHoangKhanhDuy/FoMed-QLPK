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
    (async () => {
      try {
        setLoading(true);
        // ✅ chỉ lấy dịch vụ đang hoạt động
        const res = await getService({ page: 1, pageSize: 12, isActive: true });
        // ✅ phòng hờ nếu BE chưa lọc
        const onlyActive = (res.data.items ?? []).filter((x) => x.isActive);
        setItems(onlyActive);
      } catch {
        toast.error("Không tải được danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleClick = (serviceId: number) => {
    navigate(`/booking-doctor?serviceId=${serviceId}`);
  };

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
        <h2 className="text-3xl md:text-5xl font-bold text-sky-400 text-center">
          Đặt gói khám bệnh
        </h2>
        <p className="text-lg text-center text-slate-600 mt-4">
          Các gói/dịch vụ hiện có tại FoMed
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-white rounded-xl p-5 shadow-md ring-1 ring-slate-100 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100" />
                  <div className="h-5 w-40 bg-slate-100 rounded" />
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
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-sky-100 flex items-center justify-center ring-1 ring-sky-100">
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
                          Thời lượng: {formatMinutes(s.durationMin)}
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
