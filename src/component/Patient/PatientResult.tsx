import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  apiLookupResultByCode,
  apiLookupResultByPhone,
  type LookupEncounter,
} from "../../services/lookupResultApi";
import { formatVND } from "../../Utils/formatVND";

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

  const pageLimit = 10;

  // Gọi API khi component mount
  useEffect(() => {
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
      const result = await apiLookupResultByCode(code);
      setCodeResult(result);
      toast.success("Tìm thấy thông tin hồ sơ");
    } catch (error: any) {
      toast.error(error.message || "Không tìm thấy hồ sơ");
      setCodeResult(null);
      setTimeout(() => navigate("/patient-portal-login"), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tra cứu theo SĐT
  const handleLookupByPhone = async (phone: string, page: number = 0) => {
    try {
      setLoading(true);
      const result = await apiLookupResultByPhone(phone, page, pageLimit);
      setPhoneResults(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
      setCurrentPage(page);

      if (result.items.length === 0) {
        toast.error("Không tìm thấy hồ sơ nào");
        setTimeout(() => navigate("/patient-portal-login"), 2000);
      } else {
        toast.success(`Tìm thấy ${result.total} hồ sơ`);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tra cứu");
      setPhoneResults([]);
      setTotal(0);
      setTotalPages(0);
      setTimeout(() => navigate("/patient-portal-login"), 2000);
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

  // Format trạng thái
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "Hoàn thành",
      pending: "Đang chờ",
      cancelled: "Đã hủy",
      in_progress: "Đang điều trị",
    };
    return statusMap[status] || status;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-500 mb-4">
            Kết quả tra cứu
          </h1>
        </div>

        {/* Kết quả tra cứu theo mã */}
        {state?.type === "code" && codeResult && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mã hồ sơ</p>
                <p className="font-bold text-lg text-blue-600">
                  {codeResult.encounterCode}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ngày khám</p>
                <p className="font-bold text-lg text-gray-900">
                  {formatDate(codeResult.encounterDate)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bệnh nhân</p>
                <p className="font-semibold text-gray-900">
                  {codeResult.patientName || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                <p className="font-semibold text-gray-900">
                  {codeResult.patientPhone || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bác sĩ</p>
                <p className="font-semibold text-gray-900">
                  {codeResult.doctorName || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Chuyên khoa</p>
                <p className="font-semibold text-gray-900">
                  {codeResult.specialtyName || "N/A"}
                </p>
              </div>
              <div className="md:col-span-2 bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Triệu chứng</p>
                <p className="font-semibold text-gray-900">
                  {codeResult.chiefComplaint || "N/A"}
                </p>
              </div>
              <div className="md:col-span-2 bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Chẩn đoán</p>
                <p className="font-semibold text-gray-900">
                  {codeResult.diagnosis || "N/A"}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                <p className="font-bold text-blue-600">
                  {formatStatus(codeResult.status)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng chi phí</p>
                <p className="font-bold text-lg text-green-600">
                  {codeResult.totalAmount
                    ? formatVND(codeResult.totalAmount)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kết quả tra cứu theo SĐT */}
        {state?.type === "phone" && phoneResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Danh Sách Hồ Sơ Khám Bệnh ({total} kết quả)
              </h3>
            </div>

            <div className="space-y-4">
              {phoneResults.map((record) => (
                <div
                  key={record.encounterId}
                  className="bg-gradient-to-r from-white to-blue-50 border-l-4 border-blue-500 rounded-lg p-6 hover:shadow-lg transition-shadow"
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
                        {formatDate(record.encounterDate)}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        record.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : record.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatStatus(record.status)}
                    </span>
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
      </div>
    </div>
  );
};
