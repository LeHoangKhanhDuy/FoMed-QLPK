import { useNavigate } from "react-router-dom";
import { Wrench, Clock, Home, Bell } from "lucide-react";

export default function MaintenancePage() {
  const navigate = useNavigate();

  // Giả định thời gian bảo trì kết thúc (có thể lấy từ API)
  const maintenanceEnd = new Date();
  maintenanceEnd.setHours(maintenanceEnd.getHours() + 2);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Maintenance Icon */}
        <div className="relative mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 inline-block">
            <Wrench className="w-24 h-24 text-cyan-500 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Bảo trì hệ thống
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn.
          </p>
        </div>

        {/* Time Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold text-gray-800">
              Thời gian dự kiến hoàn thành
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-cyan-600">
              {formatTime(maintenanceEnd)}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(maintenanceEnd)}
            </p>
          </div>
        </div>

        {/* What's New */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Những cải tiến mới
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">✓</span>
              <span>Cải thiện tốc độ tải trang</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">✓</span>
              <span>Tối ưu hóa quy trình đặt lịch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">✓</span>
              <span>Nâng cấp bảo mật hệ thống</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">✓</span>
              <span>Sửa các lỗi và cải thiện trải nghiệm</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-8 py-3 bg-primary-linear text-white rounded-[var(--rounded)] font-medium transition-all duration-200 mx-auto cursor-pointer"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </button>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Cần hỗ trợ khẩn cấp?
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <a
              href="tel:1900xxxx"
              className="text-cyan-600 hover:text-cyan-700 hover:underline"
            >
              📞 Hotline: 1900 xxxx
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="mailto:support@fomed.vn"
              className="text-cyan-600 hover:text-cyan-700 hover:underline"
            >
              ✉️ support@fomed.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

