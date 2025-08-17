import { MapPin, Star } from "lucide-react";
import React from "react";
import check from "../../assets/images/checklist.png";

export interface ClinicCardProps {
  name: string;
  district: string;
  rating: number; // 0 - 5 (có thể số thập phân)
  logo: string; // url ảnh
  verified?: boolean;
  actionLabel?: string; // nút CTA
  className?: string;
  onBook?: () => void; // click nút đặt khám
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  const total = 5;
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Đánh giá ${value.toFixed(1)} / 5`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={18}
          className={[
            "shrink-0 text-yellow-500",
            i < full
              ? "fill-current"
              : half && i === full
              ? "fill-current opacity-60"
              : "opacity-30",
          ].join(" ")}
        />
      ))}
      <span className="ml-1 text-sm text-yellow-500">{value.toFixed(1)}</span>
    </div>
  );
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  name,
  district,
  rating,
  logo,
  verified,
  onBook,
  actionLabel = "Đặt lịch ngay",
  className = "",
}) => {
  return (
    <section
      className={[
        "w-full bg-white rounded-2xl shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-300",
        "border border-gray-100 flex flex-col cursor-pointer",
        className,
      ].join(" ")}
    >
      <div className="p-4 flex flex-col gap-4">
        <div className="h-38 rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={logo}
            alt={name}
            className="max-h-30 max-w-[100%] object-contain"
          />
        </div>

        <div>
          <h3 className="text-base font-semibold leading-6">
            <span className="block min-h-[48px]">
              <span className="line-clamp-2">
                <span className="inline">
                  {name}
                  {verified && (
                    <img
                      src={check}
                      alt="checkLogo"
                      className="inline-block w-5 h-5 ml-1 "
                    />
                  )}
                </span>
              </span>
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={18} />
          <span className="text-sm leading-5 line-clamp-2">{district}</span>
        </div>

        <Stars value={rating} />
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

export default ClinicCard;
