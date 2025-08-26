import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SkeletonRow from "../../Utils/SkeletonRow";

interface PrescriptionItem {
  id: number;
  rx_code: string; // Mã đơn thuốc
  issued_at: string; // Ngày kê (hiển thị)
  doctor: string;
  diagnosis: string; // Chẩn đoán
}

// ====== Fake data: chỉ những đơn của bệnh nhân đã khám xong ======
const fakePrescriptions: PrescriptionItem[] = [
  {
    id: 101,
    rx_code: "DTFM-5534",
    issued_at: "2025/08/01 10:30",
    doctor: "TS.BS Nguyễn Văn A",
    diagnosis: "Cảm cúm",
  },
  {
    id: 102,
    rx_code: "DTFM-1234",
    issued_at: "2025/08/03 15:05",
    doctor: "TS.BS Nguyễn Văn A",
    diagnosis: "Viêm họng cấp",
  },
  {
    id: 103,
    rx_code: "DTFM-4334",
    issued_at: "2025/08/06 09:20",
    doctor: "TS.BS Nguyễn Văn A",
    diagnosis: "Tăng huyết áp độ 1",
  },
  {
    id: 104,
    rx_code: "DTFM-1287",
    issued_at: "2025/07/01 08:10",
    doctor: "TS.BS Nguyễn Văn A",
    diagnosis: "Dị ứng thời tiết",
  },
  {
    id: 105,
    rx_code: "DTFM-1353",
    issued_at: "2025-08-10 11:45",
    doctor: "TS.BS Nguyễn Văn A",
    diagnosis: "Viêm da cơ địa",
  },
];

export default function PrescriptionList() {
  const [loading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Search
  const filtered = (fakePrescriptions ?? []).filter((rx) => {
    const searchString = Object.values(rx).join(" ").toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // --- Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize); // 0, 1, 2, ...

  // nếu đang ở trang > totalPages thì kéo về trang hợp lệ
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    else if (totalPages > 0 && currentPage > totalPages)
      setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIdx = (currentPage - 1) * pageSize;
  const pagedItems = filtered.slice(startIdx, startIdx + pageSize);

  const handlePageChange = (pageNumber: number) => {
    if (totalPages < 2) return; // < 2 trang thì không đổi
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

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <h2 className="text-2xl font-bold text-center md:text-left">
        Danh sách đơn thuốc
      </h2>

      {/* Ô tìm kiếm */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm đơn thuốc..."
          className="border border-gray-300 rounded-sm px-4 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng đơn thuốc */}
      <div className="max-w-full mt-6 overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Mã đơn</th>
              <th className="px-6 py-3">Ngày kê</th>
              <th className="px-6 py-3">Bác sĩ</th>
              <th className="px-6 py-3">Chẩn đoán</th>
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
            ) : pagedItems.length > 0 ? (
              pagedItems.map((rx) => (
                <tr key={rx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {rx.rx_code}
                  </td>
                  <td className="px-6 py-4">{rx.issued_at}</td>
                  <td className="px-6 py-4">{rx.doctor}</td>
                  <td className="px-6 py-4">{rx.diagnosis}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to="/user/prescriptions/details"
                      className="bg-primary-linear text-white text-sm px-3 py-2 rounded-[var(--rounded)] cursor-pointer"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-600">
                  Không có đơn thuốc nào
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
}
