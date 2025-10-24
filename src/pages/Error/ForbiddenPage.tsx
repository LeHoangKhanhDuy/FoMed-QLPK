import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft, Lock } from "lucide-react";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-bold text-red-500/10 leading-none select-none">
            403
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 transform -translate-y-4">
              <ShieldAlert className="w-20 h-20 text-red-500 mx-auto" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Truy cập bị từ chối
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>
        </div>

        {/* Permission Notice */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 mb-1">
                Yêu cầu phân quyền
              </h3>
              <p className="text-sm text-gray-600">
                Trang này chỉ dành cho người dùng có quyền đặc biệt. 
                Vui lòng đăng nhập với tài khoản phù hợp.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 px-6 py-3 bg-error-linear text-white rounded-[var(--rounded)] font-medium transition-all duration-200 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

