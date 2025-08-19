import React from "react";
import check from "../../assets/images/checklist.png";

export interface ServiceClinicCardProps {
  name: string;
  services?: string;
  price: string; // 0 - 5 (có thể số thập phân)
  logo: string; // url ảnh
  verified?: boolean;
  actionLabel?: string; // nút CTA
  className?: string;
  onBook?: () => void; // click nút đặt khám
}

const ServiceClinicCard: React.FC<ServiceClinicCardProps> = ({
  name,
  price,
  services,
  logo,
  verified,
  onBook,
  actionLabel = "Đặt lịch ngay",
  className = "",
}) => {
  return (
    <section
      className={[
        "w-full bg-white rounded-xl shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-300",
        "border border-gray-100 flex flex-col cursor-pointer",
        className,
      ].join(" ")}
    >
      <div className="h-38 rounded-t-xl overflow-hidden flex items-center justify-center">
        <img src={logo} alt={name} className="w-full h-full object-cover " />
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold leading-6">
            <span className="block min-h-[48px]">
              <span className="line-clamp-2">
                <span className="inline">{services}</span>
              </span>
            </span>
          </h3>
        </div>

        <div className="text-md text-gray-500 font-semibold ">
          <span className="block min-h-[40px]">
            <span className="line-clamp-2">
              <span className="inline">
                {name}
                {verified && (
                  <img
                    src={check}
                    alt="checkLogo"
                    className="inline-block w-5 h-5 ml-1"
                  />
                )}
              </span>
            </span>
          </span>
        </div>

        <div className="text-red-500">
          <span className="text-lg font-bold">{price}</span>
        </div>
      </div>

      <div className="p-4 pt-0 mt-auto">
        <button
          type="button"
          onClick={onBook}
          className="w-full cursor-pointer rounded-xl bg-primary-linear text-white font-semibold py-3 active:scale-[0.98] transition"
        >
          {actionLabel}
        </button>
      </div>
    </section>
  );
};

export default ServiceClinicCard;
