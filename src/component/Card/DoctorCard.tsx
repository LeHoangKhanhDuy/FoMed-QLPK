import { Hospital, Stethoscope} from "lucide-react";
import React from "react";
import check from "../../assets/images/checklist.png";
import star from "../../assets/images/star.png";
import visit from "../../assets/images/user.png";

export interface ClinicCardProps {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  visitCount: number;
  logo: string;
  verified?: boolean;
  actionLabel?: string;
  className?: string;
  onBook?: () => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  name,
  specialty,
  experience,
  rating,
  visitCount,
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
      <div className="p-4 flex flex-col gap-4">
        <div className="overflow-hidden flex items-center justify-center">
          <img
            src={logo}
            alt={name}
            className="max-h-30 max-w-[100%] rounded-full object-contain"
          />
        </div>

        <div>
          <h3 className="text-base font-semibold leading-6">
            <span className="block min-h-[48px]">
              <span className="line-clamp-2">
                <span className="inline uppercase">
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
        <div className="flex items-center gap-2 text-gray-500">
          <Hospital size={20} className="text-blue-500" />
          <span className="text-sm font-semibold">{experience}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Stethoscope size={20} className="text-blue-500" />
          <span className="text-sm font-semibold leading-5 line-clamp-2">
            {specialty}
          </span>
        </div>

        <div className="flex justify-between items-center mt-2 font-bold text-md">
          <div className="flex items-center gap-2 text-yellow-400">
            <img src={star} alt="logo star" className="w-5 h-5" />
            <span>{rating}</span>
          </div>

          <div className="flex items-center gap-2 text-sky-500">
            <img src={visit} alt="logo visit" className="w-5 h-5" />
            <span>{visitCount}</span>
          </div>
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

export default ClinicCard;
