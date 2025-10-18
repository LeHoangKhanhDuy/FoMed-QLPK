import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import google from "../../assets/images/googleLogo.png";
import toast from "react-hot-toast";
import { getProfile, login, saveAuth } from "../../services/auth";
import type { AppUser } from "../../types/auth/login";

export default function LoginForm({
  onSuccess,
  onSwitchMode,
}: {
  onSuccess?: (u: AppUser) => void;
  onSwitchMode?: () => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email.");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      hasError = true;
    }
    if (hasError) return;

    try {
      setLoading(true);

      // Bước 1: Login để lấy token
      const loginRes = await login(email.trim(), password);

      if (!loginRes.token) {
        throw new Error("Không nhận được token từ server");
      }

      // Bước 2: Lấy profile chi tiết (bao gồm userId)
      let finalUser: AppUser;

      if (loginRes.user && loginRes.user.email) {
        // Nếu login response đã có user info, dùng luôn
        finalUser = loginRes.user;

        // Nhưng vẫn gọi getProfile để lấy userId (vì login không trả userId)
        try {
          const profileUser = await getProfile(loginRes.token);
          // Merge userId từ profile vào user từ login
          finalUser.userId = profileUser.userId;
        } catch (profileErr) {
          console.warn(
            "⚠️ Không lấy được profile, dùng data từ login:",
            profileErr
          );
        }
      } else {
        // Nếu không có user info từ login, phải gọi getProfile
        finalUser = await getProfile(loginRes.token);
        // Roles từ login (vì profile không trả roles)
        if (loginRes.user?.roles?.length) {
          finalUser.roles = loginRes.user.roles;
        }
      }

      // Bước 3: Lưu vào storage
      saveAuth(loginRes.token, finalUser, loginRes.refreshToken);

      // Bước 4: Thông báo thành công
      toast.success(`Chào mừng ${finalUser.name || finalUser.email}!`);

      // Bước 5: Callback để update UI
      onSuccess?.(finalUser);
    } catch (err) {
      console.error("❌ Login error:", err);
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6 bg-white rounded-sm flex flex-col justify-center flex-1 w-full max-w-md sm:max-w-xl mx-auto px-4 sm:px-8">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mt-4 mb-2 font-bold text-center text-3xl text-gray-800 text-title-sm sm:text-title-md">
              ĐĂNG NHẬP
            </h1>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="text-gray-800 text-sm mb-2 block mt-4">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full text-sm text-gray-800 border ${
                        emailError ? "border-red-500" : "border-gray-300"
                      } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                      placeholder="Nhập email..."
                    />
                    <Mail className="w-[18px] h-[18px] absolute right-4 text-gray-400" />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full text-sm text-gray-800 border ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                      placeholder="Nhập mật khẩu..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 block text-sm text-gray-800">
                      Nhớ mật khẩu
                    </span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sky-500 hover:underline font-semibold text-sm"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full shadow-md py-2.5 px-4 text-md font-semibold tracking-wide rounded-lg text-white bg-primary-linear focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </div>
              </div>
            </form>

            {/* Đăng ký */}
            <div className="mt-5">
              <p className="text-sm text-center mt-4 text-gray-500">
                Bạn không có tài khoản?
                <span
                  onClick={onSwitchMode}
                  className="text-sky-500 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Đăng ký
                </span>
              </p>
            </div>

            {/* Hoặc đăng nhập bằng mạng xã hội */}
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white sm:px-5 sm:py-2">
                  Hoặc
                </span>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800">
                <img src={google} alt="ggLogo" className="w-5 h-5" />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
