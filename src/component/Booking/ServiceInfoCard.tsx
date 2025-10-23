type ServiceInfo = {
  name: string;
  price: number;
  discountPrice?: number;
  specialty: string;
  verified?: boolean;
  durationMin?: number | null;
};

interface Props {
  service: ServiceInfo;
}

export const ServiceInfoCard = ({ service }: Props) => {
  // Format thời gian
  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  };

  return (
    <section className="md:col-span-1 md:self-start">
      <div className="sticky top-20 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <header className="px-4 py-3 bg-sky-400 border-b border-slate-200">
            <h2 className="font-semibold text-center text-white text-base sm:text-lg">
              Thông tin dịch vụ
            </h2>
          </header>

          <div className="p-4 space-y-4 text-sm sm:text-base">
            {/* Tên dịch vụ */}
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Tên dịch vụ</p>
              <p className="text-lg font-semibold">{service.name}</p>
            </div>

            {/* Chuyên khoa */}
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Chuyên khoa</p>
              <p className="text-lg font-semibold">{service.specialty}</p>
            </div>

            {/* Giá dịch vụ */}
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Giá dịch vụ</p>
              <div className="flex items-center gap-2">
                {service.discountPrice ? (
                  <>
                    <p className="text-red-500 font-bold text-lg">
                      {service.discountPrice.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-slate-400 line-through text-sm">
                      {service.price.toLocaleString("vi-VN")} đ
                    </p>
                  </>
                ) : (
                  <p className="text-red-500 font-bold text-lg">
                    {service.price.toLocaleString("vi-VN")} đ
                  </p>
                )}
              </div>
            </div>

            {/* Thời gian */}
            {service.durationMin && (
              <div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Thời gian dự kiến
                </p>
                <p className="text-lg font-semibold">
                  {formatDuration(service.durationMin)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
