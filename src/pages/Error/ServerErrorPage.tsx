import { useNavigate } from "react-router-dom";
import { ServerCrash, Home, ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ServerErrorPage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-bold text-orange-500/10 leading-none select-none">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 transform -translate-y-4">
              <ServerCrash className="w-20 h-20 text-orange-500 mx-auto" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Lỗi máy chủ
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Xin lỗi, có lỗi xảy ra ở phía máy chủ. Chúng tôi đang làm việc để khắc phục vấn đề này.
          </p>
        </div>

        {/* Error Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <div className="text-left space-y-2">
            <h3 className="text-center text-lg font-bold text-gray-800">
              Đừng lo lắng
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lỗi này không phải do bạn</li>
              <li>• Đội ngũ kỹ thuật đã nhận được thông báo</li>
              <li>• Vui lòng thử lại sau vài phút</li>
            </ul>
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="group flex items-center gap-2 px-6 py-3 bg-maintenance-linear text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Đang tải...' : 'Thử lại'}  
          </button>
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-all duration-200 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

