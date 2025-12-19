import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import logo from "../../assets/images/FoCode Logo.png";
import banner from "../../assets/animation/forgotPassAnimation.json";
import Lottie from "lottie-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Section: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16">
        <button
          className="absolute top-10 left-6 md:left-10 xl:left-45 flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition cursor-pointer"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Trở về trang chủ
        </button>

        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-30 object-contain" />
        </div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Quên mật khẩu?
          </h2>
          <p className="text-gray-600 mb-4">
            Nhập email liên kết với tài khoản, bạn sẽ nhận được mã OTP khôi phục
            tài khoản.
          </p>

          {/* Email */}
          <label className="text-gray-800 text-sm mb-1 block">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
              placeholder="Nhập email..."
            />
            <Mail className="w-[18px] h-[18px] absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Nếu đã gửi OTP, hiển thị thêm 3 input */}
          {step === 2 && (
            <>
              {/* New Password */}
              <label className="text-gray-800 text-sm mb-1 block">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-sm border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Nhập mật khẩu mới"
                />
                {showPassword ? (
                  <EyeOff
                    className="w-[18px] h-[18px] absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="w-[18px] h-[18px] absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>

              {/* Confirm Password */}
              <label className="text-gray-800 text-sm mb-1 block">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-4">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Nhập lại mật khẩu"
                />
                {showConfirmPassword ? (
                  <EyeOff
                    className="w-[18px] h-[18px] absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <Eye
                    className="w-[18px] h-[18px] absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )}
              </div>

              {/* OTP */}
              <label className="text-gray-800 text-sm mb-1 block">
                Mã OTP <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-sm border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Nhập mã OTP"
                />
                <ShieldCheck className="w-[18px] h-[18px] absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </>
          )}

          {/* Button */}
          <button
            type="button"
            onClick={() => setStep(step === 1 ? 2 : 1)}
            className="mt-2 w-full bg-primary-linear text-white font-semibold py-2 rounded-[var(--rounded)] cursor-pointer"
          >
            {step === 1 ? "Nhận mã OTP" : "Hoàn tất"}
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] items-center justify-center relative">
        <div className="text-center text-white px-6">
          <Lottie animationData={banner} />
        </div>
      </div>
    </div>
  );
}
