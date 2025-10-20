import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import google from "../../assets/images/googleLogo.png";
import toast from "react-hot-toast";
import { getProfile, login as apiLogin, saveAuth } from "../../services/auth";
import type { AppUser } from "../../types/auth/login";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/auth";

const CMS_ROLES = new Set(["ADMIN", "DOCTOR", "EMPLOYEE"] as const);
type CmsRole = "ADMIN" | "DOCTOR" | "EMPLOYEE";
type NavState = { from?: { pathname: string } } | null | undefined;

export default function LoginForm({
  onSuccess,
  onSwitchMode,
}: {
  onSuccess?: (u: AppUser) => void;
  onSwitchMode?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let bad = false;

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email.");
      bad = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ.");
      bad = true;
    }
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      bad = true;
    }
    if (bad) return;

    try {
      setLoading(true);

      const loginRes = await apiLogin(email.trim(), password);
      if (!loginRes.token) throw new Error("Không nhận được token từ server");

      let finalUser: AppUser;

      if (loginRes.user?.email) {
        finalUser = loginRes.user as AppUser;
        try {
          const profileUser = await getProfile(loginRes.token);
          finalUser.userId = profileUser.userId ?? finalUser.userId;
          finalUser.name = profileUser.name ?? finalUser.name;
        } catch (err) {
          console.warn("⚠️ Không lấy được profile:", err);
        }
      } else {
        finalUser = await getProfile(loginRes.token);
        if (loginRes.user?.roles?.length) finalUser.roles = loginRes.user.roles;
      }

      saveAuth(loginRes.token, finalUser, loginRes.refreshToken);

      // ✅ Cập nhật AuthContext
      setAuthUser({
        id: finalUser.userId!,
        email: finalUser.email,
        token: loginRes.token,
        roles: (finalUser.roles ?? []).map((r) => r.toUpperCase() as CmsRole),
        name: finalUser.name ?? null,
      });

      toast.success(`Chào mừng ${finalUser.name || finalUser.email}!`);

      onSuccess?.(finalUser);

      const state = location.state as NavState;
      const from = state?.from?.pathname;

      const hasCmsRole =
        Array.isArray(finalUser.roles) &&
        finalUser.roles.some((r) => CMS_ROLES.has(r as CmsRole));

      if (from) navigate(from, { replace: true });
      else if (hasCmsRole) navigate("/cms/dashboard", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
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
            <h1 className="mt-4 mb-2 font-bold text-center text-3xl text-gray-800">
              ĐĂNG NHẬP
            </h1>
          </div>

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
                    onClick={() => setShowPassword((p) => !p)}
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
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
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
                  className="w-full shadow-md py-2.5 px-4 text-md font-semibold rounded-lg text-white bg-primary-linear disabled:opacity-50"
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
                onClick={() => onSwitchMode?.()} // ✅ Gọi hàm tránh cảnh báo unused
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

          <div className="mb-4 grid grid-cols-1 gap-3">
            <button className="inline-flex items-center justify-center gap-3 py-3 text-sm text-gray-700 bg-gray-100 rounded-lg px-7 hover:bg-gray-200">
              <img src={google} alt="ggLogo" className="w-5 h-5" />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
