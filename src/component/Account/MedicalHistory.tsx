import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SkeletonRow from "../../Utils/SkeletonRow";
import { apiGetEncounters, type Encounter } from "../../services/encountersApi";
import { patientSchedule } from "../../services/appointmentsApi";

export const MedicalHistory = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 20;

  // --- Fetch data từ API
  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        setLoading(true);

        // Fetch cả encounters và appointments để match status
        const [encountersResponse, appointmentsResponse] = await Promise.all([
          apiGetEncounters({
            page: currentPage,
            limit: pageSize,
          }),
          // Fetch appointments với status "done" để match
          patientSchedule({ status: "done", limit: 100 }).catch(() => ({
            items: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit: 100,
          })),
        ]);

        // Match encounters với appointments để lấy status chính xác
        const encountersWithStatus = encountersResponse.items.map(
          (encounter) => {
            // Tìm appointment tương ứng dựa trên visitDate, doctorName và serviceName
            const matchedAppointment = appointmentsResponse.items.find(
              (apt) => {
                const encounterDate = new Date(encounter.encounterDate);
                const aptDate = new Date(
                  `${apt.visitDate}T${apt.visitTime || "00:00:00"}`
                );

                // Kiểm tra date có hợp lệ không (không phải "0001-01-01" hoặc invalid)
                const isValidEncounterDate =
                  encounterDate.getFullYear() > 1900 &&
                  !isNaN(encounterDate.getTime());
                const isValidAptDate =
                  aptDate.getFullYear() > 1900 && !isNaN(aptDate.getTime());

                // Match theo ngày (chỉ so sánh ngày, không so giờ) nếu cả hai đều hợp lệ
                const sameDate =
                  isValidEncounterDate && isValidAptDate
                    ? encounterDate.getFullYear() === aptDate.getFullYear() &&
                      encounterDate.getMonth() === aptDate.getMonth() &&
                      encounterDate.getDate() === aptDate.getDate()
                    : true; // Nếu date không hợp lệ, bỏ qua check date

                const sameDoctor = encounter.doctorName === apt.doctorName;
                const sameService =
                  encounter.serviceName && apt.serviceName
                    ? encounter.serviceName === apt.serviceName
                    : true; // Nếu một trong hai không có service, bỏ qua check

                // Match nếu: (cùng ngày hoặc date không hợp lệ) VÀ cùng doctor VÀ (cùng service hoặc một trong hai không có)
                return (
                  sameDate && sameDoctor && sameService && apt.status === "done"
                );
              }
            );

            // Nếu tìm thấy appointment với status "done" và encounter vẫn là "draft"
            // thì override status thành "finalized"
            if (
              matchedAppointment &&
              encounter.status?.toLowerCase() === "draft"
            ) {
              return {
                ...encounter,
                status: "finalized", 
              };
            }

            return encounter;
          }
        );

        setEncounters(encountersWithStatus);
        setTotal(encountersResponse.total || 0);
      } catch (error) {
        const errorWithResponse = error as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };

        if (errorWithResponse?.response?.status === 401) {
          const errMsg = errorWithResponse?.response?.data?.message || "";
          if (!errMsg.includes("Không xác định được bệnh nhân")) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
        } else if (errorWithResponse?.response?.status === 404) {
          toast.error("API chưa được triển khai. Vui lòng liên hệ admin.");
        } else {
          const errorMsg =
            errorWithResponse?.response?.data?.message ||
            errorWithResponse?.message;
          if (errorMsg) {
            toast.error(errorMsg);
          }
        }
        setEncounters([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEncounters();
  }, [currentPage]);

  // --- Search (client-side filter) - Optimized with useMemo
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return encounters;

    const searchLower = searchTerm.toLowerCase();
    return encounters.filter((encounter) => {
      const searchString = [
        encounter.encounterCode,
        encounter.doctorName,
        encounter.serviceName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchString.includes(searchLower);
    });
  }, [encounters, searchTerm]);

  // --- Pagination
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      if (totalPages < 2) return;
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const buildPageItems = useCallback(
    (current: number, total: number, maxButtons = 7) => {
      if (maxButtons % 2 === 0) maxButtons += 1;
      if (total <= maxButtons)
        return Array.from({ length: total }, (_, i) => i + 1);

      const items: (number | "...")[] = [];
      const side = Math.floor(maxButtons / 2);

      let start = Math.max(2, current - side);
      let end = Math.min(total - 1, current + side);

      if (current <= side) {
        start = 2;
        end = maxButtons - 1;
      } else if (current > total - side) {
        start = total - (maxButtons - 2);
        end = total - 1;
      }

      items.push(1);
      if (start > 2) items.push("...");
      for (let i = start; i <= end; i++) items.push(i);
      if (end < total - 1) items.push("...");
      items.push(total);

      return items;
    },
    []
  );

  const pageItems = useMemo(
    () => (totalPages >= 2 ? buildPageItems(currentPage, totalPages, 7) : []),
    [currentPage, totalPages, buildPageItems]
  );

  // --- Status badge - Optimized component
  const StatusBadge = ({ status }: { status?: string }) => {
    const statusConfig = useMemo(() => {
      const normalizedStatus = (status || "").trim().toUpperCase();

      switch (normalizedStatus) {
        case "DRAFT":
        case "PENDING":
          return { style: "bg-yellow-100 text-yellow-600", text: "Đang chờ" };
        case "FINALIZED":
        case "COMPLETED":
        case "FINISHED":
        case "DONE":
          return { style: "bg-green-100 text-green-600", text: "Đã khám" };
        case "CANCELLED":
        case "CANCELED":
          return { style: "bg-red-100 text-red-600", text: "Đã hủy" };
        case "IN_PROGRESS":
        case "PROCESSING":
          return { style: "bg-blue-100 text-blue-600", text: "Đang khám" };
        case "CONFIRMED":
          return {
            style: "bg-indigo-100 text-indigo-600",
            text: "Đã xác nhận",
          };
        default:
          return {
            style: "bg-gray-200 text-gray-600",
            text: normalizedStatus || "Không xác định",
          };
      }
    }, [status]);

    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${statusConfig.style}`}
      >
        {statusConfig.text}
      </span>
    );
  };

  // Format date helpers - return date-only and time-only parts
  const formatDateOnly = useCallback((dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  }, []);

  const formatTimeOnly = useCallback((dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, []);

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <h2 className="text-2xl font-bold text-center md:text-left">
        Lịch sử khám bệnh
      </h2>

      {/* Ô tìm kiếm */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hồ sơ, bác sĩ, dịch vụ..."
          className="border border-gray-300 rounded-sm px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng lịch sử khám */}
      <div className="max-w-full mt-6 overflow-x-auto rounded-sm border border-gray-200 shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Mã hồ sơ</th>
              <th className="px-4 py-3 font-semibold">Ngày khám</th>
              <th className="px-4 py-3 font-semibold">Bác sĩ</th>
              <th className="px-4 py-3 font-semibold">Dịch vụ</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-center">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} columns={6} />
                ))}
              </>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((encounter, idx) => (
                <tr
                  key={encounter.encounterCode || idx}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4 font-medium text-gray-800">
                    {encounter.encounterCode}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    <div>{formatDateOnly(encounter.encounterDate) || "-"}</div>
                    <div className="text-xs text-slate-500">
                      {formatTimeOnly(encounter.encounterDate) || ""}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {encounter.doctorName}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {encounter.serviceName || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={encounter.status} />
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <Link
                      to={`/user/medical-history/${encounter.encounterCode}`}
                      className="inline-block bg-primary-linear text-white text-sm px-4 py-2 rounded-[var(--rounded)] hover:opacity-90 transition-opacity"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-600">
                  {searchTerm
                    ? "Không tìm thấy hồ sơ nào phù hợp"
                    : "Chưa có lịch sử khám bệnh"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination: chỉ hiển thị khi >= 2 trang */}
      {totalPages >= 2 && (
        <div className="flex items-center justify-between py-4 flex-wrap gap-4">
          <p className="font-semibold px-4 text-gray-700">
            Trang <span className="font-bold text-sky-600">{currentPage}</span>{" "}
            / <span className="font-bold text-sky-600">{totalPages}</span>
            <span className="text-gray-500 ml-2">({total} hồ sơ)</span>
          </p>

          <div className="flex items-center px-4 xl:px-10 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Trang trước"
            >
              ‹
            </button>

            {pageItems.map((it, idx) =>
              it === "..." ? (
                <span
                  key={`e-${idx}`}
                  className="px-2 text-slate-400 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={it}
                  onClick={() => handlePageChange(it as number)}
                  aria-current={it === currentPage ? "page" : undefined}
                  className={[
                    "w-8 h-8 rounded-full border flex items-center justify-center text-sm transition cursor-pointer",
                    it === currentPage
                      ? "bg-sky-500 text-white border-sky-500 font-semibold"
                      : "bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:text-sky-600",
                  ].join(" ")}
                >
                  {it}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
