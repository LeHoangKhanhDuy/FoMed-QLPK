import React, { useEffect, useState } from "react";

/**
 * Patient Portal – Lookup Exam Results UI
 * - Tech: React + TailwindCSS
 * - Export a single component ready to drop into your app
 *
 * Props (all optional):
 *  - onSubmitPhone: (payload: string) => void
 *      Step 1 (gửi OTP):  onSubmitPhone(phoneDigits)
 *      Step 2 (xác minh): onSubmitPhone(`${phoneDigits}|${otp}`)
 *  - onSubmitRecord: (recordCode: string) => void
 */

export default function PatientPortalLogin({
  onSubmitPhone,
  onSubmitRecord,
}: {
  onSubmitPhone?: (payload: string) => void;
  onSubmitRecord?: (recordCode: string) => void;
}) {
  const [tab, setTab] = useState<"phone" | "record">("phone");
  const [phone, setPhone] = useState("");
  const [recordCode, setRecordCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP states
  const [otp, setOtp] = useState("");
  const [hasSentOtp, setHasSentOtp] = useState(false);

  const cleanDigits = (s: string) => s.replace(/\D/g, "");

  // --- Live validation for VN phone ---
  const phoneDigits = cleanDigits(phone);
  let phoneError = "";
  if (phone.length > 0) {
    if (!/^\d*$/.test(phone)) {
      phoneError = "Lưu ý: Chỉ được nhập số";
    } else if (!phoneDigits.startsWith("0")) {
      phoneError = "Lưu ý: Số điện thoại phải bắt đầu bằng 0";
    } else if (phoneDigits.length !== 10) {
      phoneError = "Lưu ý: Số điện thoại phải đủ 10 số";
    }
  }
  const isValidPhone = phoneDigits.length === 10 && !phoneError;

  // When phone becomes invalid, reset OTP flow
  useEffect(() => {
    if (!isValidPhone) {
      setHasSentOtp(false);
      setOtp("");
    }
  }, [isValidPhone]);

  // --- OTP validation (6 digits, numbers only) ---
  const otpError =
    otp.length > 0 && !/^\d{6}$/.test(otp) ? "Lưu ý: Mã OTP gồm 6 chữ số" : "";
  const isValidOtp = /^\d{6}$/.test(otp);

  // --- Record code validation ---
  // Format: PREFIX-XXXX-DDMMYYYY
  const recordPattern = /^[A-Z]{2,}-[A-Z0-9]{4}-\d{8}$/;
  let recordError = "";
  if (recordCode.length > 0) {
    if (!recordPattern.test(recordCode)) {
      recordError =
        "Mã hồ sơ không hợp lệ. Ví dụ: HSFM-ABCD-24082025 (PREFIX-XXXX-DDMMYYYY)";
    }
  }
  const isValidRecord = recordPattern.test(recordCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === "phone") {
      if (!isValidPhone) return;
      setSubmitting(true);
      try {
        // Step 1: gửi OTP nếu chưa gửi
        if (!hasSentOtp) {
          onSubmitPhone?.(phoneDigits);
          setHasSentOtp(true);
        } else {
          // Step 2: xác minh OTP nếu đã gửi
          if (isValidOtp) {
            onSubmitPhone?.(`${phoneDigits}|${otp}`);
          }
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (tab === "record" && isValidRecord) {
      setSubmitting(true);
      try {
        onSubmitRecord?.(recordCode.trim());
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-500 uppercase">
            Tra cứu kết quả khám bệnh
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Xem kết quả khám bệnh, xét nghiệm, đơn thuốc, ...
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer ${
                tab === "phone"
                  ? "text-sky-500 border-b-2 border-sky-500"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setTab("phone")}
            >
              Tra cứu bằng số điện thoại
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer ${
                tab === "record"
                  ? "text-sky-500 border-b-2 border-sky-500"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setTab("record")}
            >
              Tra cứu bằng mã hồ sơ
            </button>
          </div>

          {/* Body */}
          <form className="p-6" onSubmit={handleSubmit}>
            {tab === "phone" ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Số điện thoại
                </label>

                <input
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Nhập số điện thoại"
                  className={`w-full rounded-[var(--rounded)] border bg-white px-4 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 ${
                    phoneError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-300 focus:ring-sky-400"
                  }`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}

                <p className="text-xs text-slate-500">
                  Chúng tôi có thể gửi mã xác thực (OTP) tới số điện thoại của
                  bạn.
                </p>
                {/* OTP Field appears when phone is valid */}
                {isValidPhone && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                      Mã OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="Nhập OTP 6 số"
                        className={`flex-1 rounded-[var(--rounded)] border bg-white px-4 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 ${
                          otpError
                            ? "border-red-400 focus:ring-red-400"
                            : "border-slate-300 focus:ring-sky-400"
                        }`}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    {otpError && (
                      <p className="text-xs text-red-500 mt-1">{otpError}</p>
                    )}
                    {!hasSentOtp && (
                      <p className="text-xs text-slate-500">
                        Nhấn "Gửi OTP" để nhận mã qua SMS.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    !isValidPhone || submitting || (hasSentOtp && !isValidOtp)
                  }
                  className={`w-full mt-2 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    !isValidPhone || submitting || (hasSentOtp && !isValidOtp)
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-primary-linear text-white hover:bg-sky-700"
                  }`}
                >
                  {submitting
                    ? "Đang xử lý..."
                    : !hasSentOtp
                    ? "Gửi OTP"
                    : "Xác minh OTP"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Mã hồ sơ
                </label>

                <input
                  placeholder="Ví dụ: HSFM-ABCD-24082025"
                  className={`w-full rounded-[var(--rounded)] border bg-white px-4 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 ${
                    recordError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-300 focus:ring-sky-500"
                  }`}
                  value={recordCode}
                  onChange={(e) => setRecordCode(e.target.value.toUpperCase())}
                />
                {recordError && (
                  <p className="text-xs text-red-500 mt-1">{recordError}</p>
                )}

                <p className="text-xs text-slate-500">
                  Dùng mã hồ sơ được cung cấp trong phiếu khám hoặc tin nhắn.
                </p>

                <button
                  type="submit"
                  disabled={!isValidRecord || submitting}
                  className={`w-full mt-2 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    !isValidRecord || submitting
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-primary-linear text-white hover:bg-sky-700"
                  }`}
                >
                  {submitting ? "Đang xử lý..." : "Tra cứu"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Help / Footer */}
        <div className="mt-4 text-center text-xs text-slate-500">
          Bằng việc tiếp tục, bạn đồng ý với {""}
          <a className="underline cursor-pointer text-sky-500">
            Điều khoản
          </a> và {""}
          <a className="underline cursor-pointer text-sky-500">
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </div>
      </div>
    </div>
  );
}
