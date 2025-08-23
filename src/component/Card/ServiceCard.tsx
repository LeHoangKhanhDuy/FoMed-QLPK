import { Star } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export interface ServiceClinicCardProps {
  name: string;
  services?: string;
  price: string;
  logo: string;
  rating?: number;
  actionLabel?: string;
  className?: string;
  onBook?: () => void;
  linkTo?: string; // <-- thêm props đường dẫn
}

const ServiceClinicCard: React.FC<ServiceClinicCardProps> = ({
  name,
  price,
  services,
  logo,
  rating = 4.5,
  onBook,
  actionLabel = "Đặt lịch ngay",
  className = "",
  linkTo = "/booking-doctor", // <-- default route
}) => {

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating); // số sao đầy
    const hasHalfStar = rating % 1 >= 0.5; // có nửa sao không

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Sao đầy
        stars.push(
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        // Sao nửa: 1 sao màu xám + overlay vàng 50%
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      } else {
        // Sao rỗng
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }

    return stars;
  };
  
  return (
    <Link
      to={linkTo}
      className={[
        "w-full bg-white rounded-xl shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-300",
        "border border-gray-100 flex flex-col cursor-pointer",
        className,
      ].join(" ")}
    >
      <div className="h-38 rounded-t-xl overflow-hidden flex items-center justify-center">
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold leading-6">
            <span className="block min-h-[48px]">
              <span className="line-clamp-2">{services}</span>
            </span>
          </h3>
        </div>

        {/* Hiển thị rating */}
        <div className="flex items-center gap-1">
          {renderStars(rating)}
          <span className="ml-1 text-sm text-gray-500">
            ({rating.toFixed(1)})
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
    </Link>
  );
};

export default ServiceClinicCard;
