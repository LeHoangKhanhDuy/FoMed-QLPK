import { Star } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import defaultImage from "../../assets/images/khamtongquat.jpg";

export interface ServiceClinicCardProps {
  name: string;
  services?: string;
  price: string;
  logo?: string; // ✅ Optional
  rating?: number;
  verified?: boolean; // ✅ Thêm verified
  actionLabel?: string;
  className?: string;
  onBook?: () => void;
  linkTo?: string;
  onLoginRequired?: () => void; // ✅ Callback để hiển thị modal đăng nhập
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
  onLoginRequired,
}) => {
  const navigate = useNavigate();
  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Kiểm tra đăng nhập
    const userInfo = localStorage.getItem("userInfo");
    const userToken = localStorage.getItem("userToken");

    if (!userInfo || !userToken) {
      // Chưa đăng nhập - hiển thị modal
      toast.error("Vui lòng đăng nhập để đặt lịch khám!");
      localStorage.setItem("redirectAfterLogin", linkTo);
      onLoginRequired?.();
      return;
    }

    // Đã đăng nhập - gọi callback hoặc navigate
    if (onBook) {
      onBook();
    } else {
      navigate(linkTo);
    }
  };

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
      {/* Ảnh */}
      <div className="h-38 rounded-t-xl overflow-hidden flex items-center justify-center bg-gray-50">
        <img
          src={logo || defaultImage} // Fallback ở đây nữa cho an toàn
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = defaultImage; // Thay bằng ảnh mặc định nếu lỗi
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Tên dịch vụ */}
        <div>
          <h3 className="text-xl font-semibold leading-6">
            <span className="block min-h-[48px]">
              <span className="line-clamp-2">{services}</span>
            </span>
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {renderStars(rating)}
          <span className="ml-1 text-sm text-gray-500">
            ({rating.toFixed(1)})
          </span>
        </div>

        {/* Giá */}
        <div className="text-red-500">
          <span className="text-lg font-bold">{price}</span>
        </div>
      </div>

      <div className="p-4 pt-0 mt-auto">
        <button
          type="button"
          onClick={handleBookClick}
          className="w-full cursor-pointer rounded-xl bg-primary-linear text-white font-semibold py-3 active:scale-[0.98] transition"
        >
          {actionLabel}
        </button>
      </div>
    </Link>
  );
};

export default ServiceClinicCard;
