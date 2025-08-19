import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import google from "../../assets/images/googleLogo.png";



export default function LoginForm({
  //onSuccess,
  onSwitchMode,
}: {
  onSuccess?: () => void;
  onSwitchMode?: () => void;
}) {
  //const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!email) {
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

    if (hasError) {
      setLoading(false);
      return;
    }

    // const success = await handleLogin(email, password);
    // if (success) {
    //   if (onSuccess) {
    //     onSuccess();
    //     window.location.reload();
    //   }
    // } else {
    //   toast.error("Tài khoản hoặc mật khẩu không đúng");
    //   setPasswordError("");
    // }

    // setLoading(false);
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
                      onChange={(e) => setPassword(e.target.value)}
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
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm text-gray-800"
                    >
                      Nhớ mật khẩu
                    </label>
                  </div>
                  <div className="text-sm">
                    <a
                      href="/forgot-password"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                </div>

                {/* Submit */}
                <div>
                  <button
                    disabled={loading}
                    className="w-full shadow-md py-2.5 px-4 text-md font-semibold tracking-wide rounded-lg text-white bg-primary-linear focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="text-blue-600 font-semibold hover:underline ml-1 cursor-pointer"
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
              <button
                //onClick={googleLogin}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 cursor-pointer"
              >
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
