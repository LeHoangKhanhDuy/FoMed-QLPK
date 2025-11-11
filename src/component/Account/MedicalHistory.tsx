import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SkeletonRow from "../../Utils/SkeletonRow";
import { apiGetEncounters, type Encounter } from "../../services/encountersApi";

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
        const response = await apiGetEncounters({
          page: currentPage,
          limit: pageSize,
        });
        setEncounters(response.items || []);
        setTotal(response.total || 0);
      } catch (error) {
        const errorWithResponse = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        if (errorWithResponse?.response?.status === 401) {
          const errMsg = errorWithResponse?.response?.data?.message || "";
          if (!errMsg.includes("Không xác định được bệnh nhân")) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
        } else if (errorWithResponse?.response?.status === 404) {
          toast.error("API chưa được triển khai. Vui lòng liên hệ admin.");
        } else {
          const errorMsg = errorWithResponse?.response?.data?.message || errorWithResponse?.message;
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

  // --- Search (client-side filter)
  const filteredHistory = encounters.filter((encounter) => {
    const searchString = [
      encounter.encounterCode,
      encounter.doctorName,
      encounter.serviceName,
      encounter.chiefComplaint,
      encounter.diagnosis,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // --- Pagination
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (pageNumber: number) => {
    if (totalPages < 2) return; // không cho đổi trang khi < 2 trang
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const buildPageItems = (current: number, total: number, maxButtons = 7) => {
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
  };

  const pageItems =
    totalPages >= 2 ? buildPageItems(currentPage, totalPages, 7) : [];

  // --- Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    let style = "";
    let text = "";

    const statusUpper = status?.toUpperCase() || "";

    switch (statusUpper) {
      case "PENDING":
        style = "bg-yellow-100 text-yellow-600";
        text = "Đang chờ";
        break;
      case "COMPLETED":
        style = "bg-green-100 text-green-600";
        text = "Đã khám";
        break;
      case "CANCELLED":
      case "CANCELED":
        style = "bg-red-100 text-red-600";
        text = "Đã hủy";
        break;
      case "IN_PROGRESS":
        style = "bg-blue-100 text-blue-600";
        text = "Đang khám";
        break;
      default:
        style = "bg-gray-200 text-gray-600";
        text = status || "Không xác định";
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

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <h2 className="text-2xl font-bold text-center md:text-left">
        Lịch sử khám bệnh
      </h2>

      {/* Ô tìm kiếm */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm hồ sơ..."
          className="border border-gray-300 rounded-sm px-4 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng lịch sử khám */}
      <div className="max-w-full mt-6 overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-[1000px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Mã hồ sơ</th>
              <th className="px-6 py-3">Ngày khám</th>
              <th className="px-6 py-3">Bác sĩ</th>
              <th className="px-6 py-3">Dịch vụ</th>
              <th className="px-6 py-3">Lý do khám</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} columns={7} />
                ))}
              </>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((encounter, idx) => (
                <tr
                  key={encounter.encounterCode || idx}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-5 py-4 font-medium text-gray-800">
                    {encounter.encounterCode}
                  </td>
                  <td className="px-5 py-4">
                    {formatDate(encounter.encounterDate)}
                  </td>
                  <td className="px-5 py-4">{encounter.doctorName}</td>
                  <td className="px-5 py-4">{encounter.serviceName || "-"}</td>
                  <td className="px-5 py-4">
                    {encounter.chiefComplaint || "-"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={encounter.status} />
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <Link
                      to={`/user/medical-history/${encounter.encounterCode}`}
                      className="bg-primary-linear text-white text-sm px-3 py-2 rounded-[var(--rounded)] cursor-pointer"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-4 text-center text-gray-600">
                  {searchTerm
                    ? "Không tìm thấy hồ sơ nào"
                    : "Chưa có lịch sử khám bệnh"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination: chỉ hiển thị khi >= 2 trang */}
      {totalPages >= 2 && (
        <div className="flex items-center justify-between py-4">
          <p className="font-semibold px-4 text-black">
            Trang{" "}
            <span className="font-semibold text-black">{currentPage}</span> -{" "}
            <span className="font-semibold text-black">{totalPages}</span>
          </p>

          <div className="flex items-center px-4 xl:px-10 gap-2">
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
                      ? "bg-sky-400 text-white"
                      : "bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:text-sky-600",
                  ].join(" ")}
                >
                  {it}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
