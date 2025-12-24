import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  apiLookupResultByCode,
  apiLookupResultByPhone,
  type LookupEncounter,
} from "../../services/lookupResultApi";
import Lottie from "lottie-react";
import { formatVND } from "../../Utils/formatVND";
import medicalHealthcareAnim from "../../assets/animation/Medical Healthcare.json";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { ClipboardList, ListTodo, Pill, TestTubeDiagonal } from "lucide-react";

type LocationState = {
  type: "phone" | "code";
  phone?: string;
  code?: string;
};

export const PatientResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [loading, setLoading] = useState(true);
  const [codeResult, setCodeResult] = useState<LookupEncounter | null>(null);
  const [phoneResults, setPhoneResults] = useState<LookupEncounter[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [codeError, setCodeError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Guard for React StrictMode (dev) where effects may run twice
  const didInitLookupRef = useRef(false);

  const pageLimit = 10;

  // Gọi API khi component mount
  useEffect(() => {
    if (didInitLookupRef.current) return;
    didInitLookupRef.current = true;

    // Nếu không có state, redirect về trang portal
    if (!state || !state.type) {
      navigate("/patient-portal-login");
      return;
    }

    // Gọi API dựa vào type
    if (state.type === "code" && state.code) {
      handleLookupByCode(state.code);
    } else if (state.type === "phone" && state.phone) {
      handleLookupByPhone(state.phone, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý tra cứu theo mã
  const handleLookupByCode = async (code: string) => {
    try {
      setLoading(true);
      setCodeError("");
      const result = await apiLookupResultByCode(code);
      setCodeResult(result);
      toast.success("Tìm thấy thông tin hồ sơ", { id: "lookup-code-success" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không tìm thấy hồ sơ";
      toast.error(errorMessage, { id: "lookup-code-error" });
      setCodeResult(null);
      setCodeError("Không tìm thấy hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tra cứu theo SĐT
  const handleLookupByPhone = async (phone: string, page: number = 0) => {
    try {
      setLoading(true);
      setPhoneError("");
      const result = await apiLookupResultByPhone(phone, page, pageLimit);
      setPhoneResults(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
      setCurrentPage(page);

      if (result.items.length === 0) {
        toast.error("Không tìm thấy hồ sơ nào", { id: "lookup-phone-empty" });
        setPhoneError("Không tìm thấy hồ sơ nào cho số điện thoại này.");
      } else {
        toast.success(`Tìm thấy ${result.total} hồ sơ`, {
          id: "lookup-phone-success",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể tra cứu";
      toast.error(errorMessage, { id: "lookup-phone-error" });
      setPhoneResults([]);
      setTotal(0);
      setTotalPages(0);
      setPhoneError("Có lỗi xảy ra khi tra cứu.");
    } finally {
      setLoading(false);
    }
  };

  // Chuyển trang
  const handlePageChange = (newPage: number) => {
    if (state && state.phone) {
      handleLookupByPhone(state.phone, newPage);
    }
  };

  // Format ngày
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    const normalizedStatus = (status || "").trim().toUpperCase();
    let style = "bg-gray-200 text-gray-600";
    let text = normalizedStatus || "Không xác định";

    switch (normalizedStatus) {
      case "DRAFT":
      case "PENDING":
        style = "bg-yellow-100 text-yellow-600";
        text = "Đang chờ";
        break;
      case "FINALIZED":
      case "COMPLETED":
      case "FINISHED":
      case "DONE":
        style = "bg-green-100 text-green-600";
        text = "Đã khám";
        break;
      case "CANCELLED":
      case "CANCELED":
        style = "bg-red-100 text-red-600";
        text = "Đã hủy";
        break;
      case "IN_PROGRESS":
      case "PROCESSING":
        style = "bg-blue-100 text-blue-600";
        text = "Đang khám";
        break;
      case "CONFIRMED":
        style = "bg-indigo-100 text-indigo-600";
        text = "Đã xác nhận";
        break;
      default:
        break;
    }

    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${style}`}
      >
        {text}
      </span>
    );
  };

  const getEncounterDateTime = (e?: LookupEncounter | null) =>
    e?.visitAt ?? e?.encounterDate;

  const getPatientName = (e?: LookupEncounter | null) =>
    e?.patient?.fullName ?? e?.patientName;

  const getPatientCode = (e?: LookupEncounter | null) =>
    e?.patient?.patientCode;

  const getQrValue = (e?: LookupEncounter | null) =>
    getPatientCode(e) || e?.encounterCode || "";

  const getLabField = (obj: unknown, keys: string[]) => {
    if (!obj || typeof obj !== "object") return undefined;
    const rec = obj as Record<string, unknown>;
    for (const k of keys) {
      const v = rec[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return undefined;
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm p-12 text-center">
            <div className="mx-auto max-w-lg">
              <Lottie animationData={medicalHealthcareAnim} loop />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Đang tra cứu thông tin...
            </h2>
            <p className="text-gray-600 mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Kết quả tra cứu
            </h1>
            {state?.type === "code" && codeResult?.encounterCode && (
              <p className="text-md text-slate-600 mt-1">
                Mã hồ sơ:{" "}
                <span className="font-semibold text-sky-500">
                  {codeResult.encounterCode}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[var(--rounded)] bg-primary-linear px-4 py-2 text-white font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Tải PDF
          </button>
        </div>

        {/* Kết quả tra cứu theo mã */}
        {state?.type === "code" && codeResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-8 space-y-4">
              {/* Kết quả khám */}
              <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sky-500">
                    <ClipboardList className="w-5 h-5" />
                    <div>Kết quả khám</div>
                  </div>
                  <StatusBadge status={codeResult.status} />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Dịch vụ</div>
                      <div className="font-semibold text-slate-900">
                        {codeResult.serviceName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Thời gian khám</div>
                      <div className="font-semibold text-slate-900">
                        {formatDateTime(getEncounterDateTime(codeResult))}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Bác sĩ</div>
                      <div className="font-semibold text-slate-900">
                        {codeResult.doctorName || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 mb-1">
                        Chẩn đoán
                      </div>
                      <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-[var(--rounded)] p-3">
                        {codeResult.diagnosis || "Chưa có chẩn đoán"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kết quả xét nghiệm */}
              <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sky-500">
                    <TestTubeDiagonal className="w-5 h-5" />
                    <div>Kết quả xét nghiệm</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto border border-slate-200 rounded-[var(--rounded)]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Tên xét nghiệm
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Kết quả
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Đơn vị
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Giá trị tham chiếu
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(codeResult.labs) &&
                        codeResult.labs.length > 0 ? (
                          codeResult.labs.map((lab, idx) => {
                            const testName =
                              getLabField(lab, [
                                "testName",
                                "name",
                                "medicineName",
                                "title",
                              ]) ?? `XN #${idx + 1}`;
                            const result =
                              getLabField(lab, ["result", "value", "ketQua"]) ??
                              "N/A";
                            const unit =
                              getLabField(lab, ["unit", "donVi"]) ?? "";
                            const ref =
                              getLabField(lab, [
                                "referenceRange",
                                "ref",
                                "normalRange",
                                "giaTriThamChieu",
                              ]) ?? "";

                            return (
                              <tr
                                key={idx}
                                className="border-t border-slate-200"
                              >
                                <td className="px-4 py-2 font-semibold text-slate-900">
                                  {String(testName)}
                                </td>
                                <td className="px-4 py-2 text-slate-700">
                                  {String(result)}
                                </td>
                                <td className="px-4 py-2 text-slate-700">
                                  {String(unit)}
                                </td>
                                <td className="px-4 py-2 text-slate-700">
                                  {String(ref)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-6 text-center text-slate-600"
                            >
                              Chưa có kết quả xét nghiệm.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Đơn thuốc */}
              <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sky-500">
                    <Pill className="w-5 h-5" />
                    <div>Đơn thuốc</div>
                  </div>
                    {codeResult.prescription?.code ? (
                      <div className="text-sm text-slate-600">
                        Mã đơn thuốc:{" "}
                        <span className="font-semibold text-sky-500">
                          {codeResult.prescription.code}
                        </span>
                      </div>
                    ) : null}
                </div>
                <div className="p-4">
                  {codeResult.prescription?.advice && (
                    <div className="mb-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        Lời dặn của bác sĩ:{" "}
                        <p className="text-black font-semibold">
                          {codeResult.prescription.advice}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto border border-slate-200 rounded-[var(--rounded)]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Thuốc
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Liều
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Lần/ngày
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-slate-700">
                            Số ngày
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(codeResult.prescription?.items) &&
                        codeResult.prescription!.items!.length > 0 ? (
                          codeResult.prescription!.items!.map((it, idx) => (
                            <tr key={idx} className="border-t border-slate-200">
                              <td className="px-4 py-2 font-semibold text-slate-900">
                                {it.medicineName || "N/A"}
                              </td>
                              <td className="px-4 py-2 text-slate-700">
                                {it.dose ?? "N/A"}
                              </td>
                              <td className="px-4 py-2 text-slate-700">
                                {it.frequency ?? "N/A"}
                              </td>
                              <td className="px-4 py-2 text-slate-700">
                                {it.duration ?? "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-6 text-center text-slate-600"
                            >
                              Chưa có thông tin đơn thuốc.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-4 space-y-4">
              {/* Patient card */}
              <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={defaultAvatar}
                    alt="Avatar"
                    className="h-14 w-14 rounded-full border border-slate-200 object-cover bg-slate-100"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-slate-500">Họ tên</div>
                    <div className="font-bold text-slate-900">
                      {getPatientName(codeResult) || "N/A"}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Mã BN:{" "}
                      <span className="font-semibold">
                        {getPatientCode(codeResult) || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                    {getQrValue(codeResult) ? (
                      <QRCodeSVG value={getQrValue(codeResult)} size={56} />
                    ) : (
                      <span className="text-xs text-slate-500">QR</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách dịch vụ */}
              <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 font-bold text-sky-500">
                  <div className="flex items-center gap-2 font-bold text-sky-500">
                    <ListTodo className="w-5 h-5" />
                    <div>Danh sách dịch vụ</div>
                  </div>
                </div>
                <div className="p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">
                      {codeResult.serviceName || "N/A"}
                    </div>
                    <div className="text-slate-600">
                      {formatDate(getEncounterDateTime(codeResult))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {state?.type === "code" && !codeResult && codeError && (
          <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-xl font-semibold text-slate-700">{codeError}</p>
          </div>
        )}

        {/* Kết quả tra cứu theo SĐT */}
        {state?.type === "phone" && phoneResults.length > 0 && (
          <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Danh Sách Hồ Sơ Khám Bệnh ({total} kết quả)
              </h3>
            </div>

            <div className="space-y-4">
              {phoneResults.map((record) => (
                <div
                  key={record.encounterId ?? record.encounterCode}
                  className="bg-gradient-to-r from-white to-blue-50 border-l-4 border-blue-500 rounded-[var(--rounded)] p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-xl text-blue-600 mb-1">
                        {record.encounterCode}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(record.visitAt ?? record.encounterDate)}
                      </p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <div>
                        <span className="text-gray-600">Bác sĩ: </span>
                        <span className="font-semibold">
                          {record.doctorName || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <div>
                        <span className="text-gray-600">Chuyên khoa: </span>
                        <span className="font-semibold">
                          {record.specialtyName || "N/A"}
                        </span>
                      </div>
                    </div>
                    {record.chiefComplaint && (
                      <div className="md:col-span-2 bg-yellow-50 p-3 rounded-lg">
                        <span className="text-gray-600 font-medium">
                          Triệu chứng:{" "}
                        </span>
                        <span className="font-semibold">
                          {record.chiefComplaint}
                        </span>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div className="md:col-span-2 bg-green-50 p-3 rounded-lg">
                        <span className="text-gray-600 font-medium">
                          Chẩn đoán:{" "}
                        </span>
                        <span className="font-semibold">
                          {record.diagnosis}
                        </span>
                      </div>
                    )}
                    {record.totalAmount && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <span className="text-gray-600">Chi phí: </span>
                          <span className="font-bold text-green-600 text-lg">
                            {formatVND(record.totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ← Trước
                </button>
                <span className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        )}

        {state?.type === "phone" && phoneResults.length === 0 && phoneError && (
          <div className="bg-white rounded-[var(--rounded)] border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-xl font-semibold text-slate-700">{phoneError}</p>
          </div>
        )}
      </div>
    </div>
  );
};
