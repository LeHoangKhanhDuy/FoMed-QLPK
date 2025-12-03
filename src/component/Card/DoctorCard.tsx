// src/components/doctor/DoctorCard.tsx
import { Hospital, Stethoscope, Star, Users } from "lucide-react"; // Dùng Users icon cho đúng ngữ cảnh
import React from "react";
import check from "../../assets/images/checklist.png";
import { Link } from "react-router-dom";

export interface DoctorCardProps {
  id?: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  visitCount: number; // Số lượt khám
  logo: string;
  verified?: boolean;
  className?: string;
  detailHref?: string;
  bookHref?: string;
  onView?: () => void;
  onBook?: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  id,
  name,
  specialty,
  experience,
  rating,
  visitCount,
  logo,
  verified,
  className = "",
  detailHref = id ? `/user/doctor/${id}` : "/user/doctor-list",
  bookHref = id ? `/booking/select-service?doctorId=${id}` : "/booking/select-service",
  onView,
  onBook,
}) => {
  return (
    <section
      className={[
        "group w-full bg-white rounded-xl shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-300",
        "border border-gray-100 flex flex-col cursor-pointer overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="p-4 flex flex-col gap-3 h-full">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <img
              src={logo}
              alt={name}
              className="w-full h-full rounded-full object-cover border-2 border-gray-50 shadow-sm group-hover:border-sky-100 transition-colors"
            />
            {verified && (
              <img
                src={check}
                alt="Verified"
                className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full p-0.5"
              />
            )}
          </div>
        </div>

        {/* Name */}
        <div className="text-center min-h-[48px]">
          <h3 className="text-base font-bold text-slate-800 uppercase line-clamp-2 group-hover:text-sky-600 transition-colors">
            {name}
          </h3>
        </div>

        {/* Info Lines */}
        <div className="space-y-2 text-sm text-slate-600 mt-1">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="font-medium truncate">{experience}</span>
          </div>

          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="font-medium truncate">{specialty}</span>
          </div>
        </div>

        {/* Rating & Visit Count Footer */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>

          {/* Lượt khám (FIXED UI) */}
          <div className="flex items-center gap-1.5 text-sky-600 font-semibold text-sm bg-sky-50 px-2 py-1 rounded-md">
            <Users className="w-4 h-4" />
            <span>{visitCount.toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 p-4 pt-0">
        <Link to={detailHref} className="w-full">
          <button
            type="button"
            onClick={onView}
            className="w-full py-2 rounded-[var(--rounded)] border border-sky-500 text-sky-600 hover:bg-sky-50 font-semibold text-sm transition-colors cursor-pointer"
          >
            Chi tiết
          </button>
        </Link>

        {onBook ? (
          <button
            type="button"
            onClick={onBook}
            className="w-full py-2 rounded-[var(--rounded)] bg-primary-linear text-white hover:bg-sky-600 font-semibold text-sm transition-colors shadow-sm shadow-sky-200 cursor-pointer"
          >
            Đặt lịch
          </button>
        ) : (
          <Link to={bookHref} className="w-full">
            <button
              type="button"
              className="w-full py-2 rounded-[var(--rounded)] bg-primary-linear text-white hover:bg-sky-600 font-semibold text-sm transition-colors shadow-sm shadow-sky-200 cursor-pointer"
            >
              Đặt lịch
            </button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default DoctorCard;