import { Check, Eye, EyeOff, Mail, User2Icon, X } from "lucide-react";
import googleLogo from "../../assets/images/googleLogo.png";
import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { login, register, saveAuth } from "../../services/auth";

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function SignUpForm({
  onSwitchMode,
  onSuccess,
}: {
  onSuccess?: () => void;
  onSwitchMode?: () => void;
}) {
  //const { handleSignup } = useAuth();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToTermsError, setAgreeToTermsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    lower: false,
    upper: false,
    number: false,
    special: false,
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const getErrMsg = (error: unknown): string => {
    if (isAxiosError(error)) {
      const data = error.response?.data as ErrorResponse | undefined;

      // Ưu tiên lỗi "message"
      if (data?.message) return data.message;

      // Nếu có ModelState errors => gộp lại
      if (data?.errors) {
        return Object.values(data.errors).flat().join("; ");
      }
    }

    return "Có lỗi xảy ra.";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
    setAgreeToTermsError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên đăng nhập.");
      hasError = true;
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu.");
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Mật khẩu không khớp.");
      hasError = true;
    }

    if (!agreeToTerms) {
      setAgreeToTermsError("Bạn cần đồng ý với điều khoản.");
      setLoading(false);
      return;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const reg = await register(email.trim(), password, name.trim());
      const token = reg?.data?.Token ?? reg?.data?.token;
      const refreshToken = reg?.data?.RefreshToken ?? reg?.data?.refreshToken;

      if (token) {
        saveAuth(
          token,
          {
            userId: 0,
            email: email.trim(),
            name: name.trim(),
            phone: "",
            roles: [],
          },
          refreshToken
        );
      } else {
        const logged = await login(email.trim(), password);
        saveAuth(logged.token!, logged.user, logged.refreshToken);
      }
      toast.success("Đăng ký thành công!");
      onSuccess?.(); 
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: unknown) {
      const msg = getErrMsg(error);
      if (/email/i.test(msg) && /(tồn tại|exist)/i.test(msg)) {
        setEmailError("Email đã tồn tại.");
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const validatePassword = (value: string) => {
    setPasswordValidation({
      minLength: value.length >= 8,
      lower: /[a-z]/.test(value),
      upper: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6 bg-white rounded-sm flex flex-col justify-center flex-1 w-full max-w-md sm:max-w-xl mx-auto px-5 sm:px-8">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mt-4 mb-2 font-bold text-center text-3xl text-gray-800 text-title-sm sm:text-title-md">
              ĐĂNG KÝ
            </h1>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="text-gray-800 text-sm mb-2 block mt-4">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full text-sm text-gray-800 border ${
                        nameError ? "border-red-500" : "border-gray-300"
                      } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                      placeholder="Nhập tên đăng nhập..."
                    />
                    <User2Icon
                      className="w-[18px] h-[18px] absolute right-4 text-gray-400 cursor-pointer"
                      viewBox="0 0 24 24"
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>

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
                    <Mail
                      className="w-[18px] h-[18px] absolute right-4 text-gray-400 cursor-pointer"
                      viewBox="0 0 24 24"
                    />
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setPassword(val);
                        validatePassword(val);
                        setShowPasswordRules(val.length > 0);
                      }}
                      className={`w-full text-sm text-gray-800 border ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                      placeholder="Nhập mật khẩu..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 text-gray-400 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                  {showPasswordRules && (
                    <ul className="mt-2 text-sm space-y-1">
                      <li className="flex items-center gap-2 text-gray-700">
                        {passwordValidation.minLength ? (
                          <span className="text-green-500">
                            <Check className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="text-red-500">
                            <X className="w-5 h-5" />
                          </span>
                        )}
                        Tối thiểu 8 ký tự
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        {passwordValidation.lower ? (
                          <span className="text-green-500">
                            <Check className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="text-red-500">
                            <X className="w-5 h-5" />
                          </span>
                        )}
                        Chữ thường
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        {passwordValidation.upper ? (
                          <span className="text-green-500">
                            <Check className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="text-red-500">
                            <X className="w-5 h-5" />
                          </span>
                        )}
                        Chữ in hoa
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        {passwordValidation.number ? (
                          <span className="text-green-500">
                            <Check className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="text-red-500">
                            <X className="w-5 h-5" />
                          </span>
                        )}
                        Chứa số
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        {passwordValidation.special ? (
                          <span className="text-green-500">
                            <Check className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="text-red-500">
                            <X className="w-5 h-5" />
                          </span>
                        )}
                        Ký tự đặc biệt (~!@#$%^&*)
                      </li>
                    </ul>
                  )}
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full text-sm text-gray-800 border ${
                        confirmPasswordError
                          ? "border-red-500"
                          : "border-gray-300"
                      } pl-4 pr-10 py-3 rounded-lg outline-blue-600`}
                      placeholder="Nhập lại mật khẩu..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 text-gray-400 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-1 text-sm text-red-600">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      id="agree-to-terms"
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => {
                        setAgreeToTerms(e.target.checked);
                        setAgreeToTermsError("");
                      }}
                      className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm text-gray-800"
                    >
                      Tôi đồng ý với{" "}
                      <a
                        target="_blank"
                        href="/help/dieu-khoan-dich-vu"
                        className="text-sky-500 font-semibold hover:underline cursor-pointer"
                      >
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a
                        target="_blank"
                        href="/help/chinh-sach-bao-mat"
                        className="text-sky-500 font-semibold hover:underline cursor-pointer"
                      >
                        Chính sách bảo mật
                      </a>{" "}
                      của FoMed
                    </label>
                  </div>
                  {agreeToTermsError && (
                    <p className="mt-1 text-sm text-red-600">
                      {agreeToTermsError}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div>
                  <button
                    disabled={loading}
                    className="w-full shadow-md py-2.5 px-4 text-md font-semibold tracking-wide rounded-lg text-white bg-primary-linear focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                  </button>
                </div>
              </div>
            </form>

            {/* Đăng ký */}
            <div className="mt-5">
              <p className="text-sm text-center mt-4 text-gray-500">
                Bạn đã có tài khoản
                <span
                  onClick={onSwitchMode}
                  className="text-sky-500 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Đăng nhập
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
              <button
                //onClick={googleLogin}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 cursor-pointer"
              >
                <img src={googleLogo} alt="ggLogo" className="w-5 h-5" />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
