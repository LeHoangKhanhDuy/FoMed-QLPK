// src/components/doctor/ClinicCard.tsx
import { Hospital, Stethoscope } from "lucide-react";
import React from "react";
import check from "../../assets/images/checklist.png";
import star from "../../assets/images/star.png";
import visit from "../../assets/images/user.png";
import { Link } from "react-router-dom";

export interface DoctorCardProps {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  visitCount: number;
  logo: string;
  verified?: boolean;
  className?: string;

  // NEW (tùy chọn)
  detailHref?: string; // link trang chi tiết
  bookHref?: string; // link trang đặt lịch
  onView?: () => void; // handler khi bấm Chi tiết
  onBook?: () => void; // handler khi bấm Đặt lịch
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  name,
  specialty,
  experience,
  rating,
  visitCount,
  logo,
  verified,
  className = "",
  // default fallback
  detailHref = "/user/doctor",
  bookHref = "/user/doctor",
  onView,
  onBook,
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
                <span className="flex items-center uppercase">
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

      {/* Nút hành động: Chi tiết + Đặt lịch */}
      <div className="grid grid-cols-2 gap-3 p-4 pt-0 mt-auto">
        <Link to={detailHref} className="w-full">
          <button
            type="button"
            onClick={onView}
            className="w-full cursor-pointer rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-50 font-semibold py-2 active:scale-[0.98] transition"
          >
            Chi tiết
          </button>
        </Link>

        <Link to={bookHref} className="w-full">
          <button
            type="button"
            onClick={onBook}
            className="w-full cursor-pointer rounded-xl bg-primary-linear text-white font-semibold py-2 active:scale-[0.98] transition"
          >
            Đặt lịch
          </button>
        </Link>
      </div>
    </section>
  );
};

export default DoctorCard;
