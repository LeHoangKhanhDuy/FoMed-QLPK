import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type LabStatus =
  | "pending"
  | "processing"
  | "completed"
  | "abnormal"
  | "canceled";

interface LabResultRow {
  id: number;
  result_code: string; // Mã phiếu
  collected_at: string; // Ngày lấy mẫu
  service_name: string; // Loại xét nghiệm / gói
  status: LabStatus;
}

const FAKE_LIST: LabResultRow[] = [
  {
    id: 9001,
    result_code: "LR-0001",
    collected_at: "2025/08/01 09:10",
    service_name: "Sinh hóa máu cơ bản",
    status: "completed",
  },
  {
    id: 9002,
    result_code: "LR-0002",
    collected_at: "2025/08/03 10:05",
    service_name: "CRP định lượng",
    status: "processing",
  },
  {
    id: 9003,
    result_code: "LR-0003",
    collected_at: "2025/08/06 08:40",
    service_name: "Huyết học tổng quát",
    status: "abnormal",
  },
  {
    id: 9004,
    result_code: "LR-0004",
    collected_at: "2025/07/28 14:20",
    service_name: "Xét nghiệm nước tiểu",
    status: "pending",
  },
  {
    id: 9005,
    result_code: "LR-0005",
    collected_at: "2025/07/20 09:00",
    service_name: "FT4, TSH",
    status: "canceled",
  },
];

const StatusBadge = ({ status }: { status: LabStatus }) => {
  const map: Record<LabStatus, { cls: string; text: string }> = {
    pending: { cls: "bg-yellow-100 text-yellow-700", text: "Chờ xử lý" },
    processing: { cls: "bg-blue-100 text-blue-500", text: "Đang xử lý" },
    completed: { cls: "bg-green-100 text-green-600", text: "Bình thường" },
    abnormal: { cls: "bg-red-100 text-red-600", text: "Bất thường" },
    canceled: { cls: "bg-gray-200 text-gray-600", text: "Đã hủy" },
  };
  const m = map[status];
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${m.cls}`}
    >
      {m.text}
    </span>
  );
};

export default function LabResultsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return FAKE_LIST.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(q)
    );
  }, [searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    else if (totalPages > 0 && currentPage > totalPages)
      setCurrentPage(totalPages);
  }, [totalPages, currentPage]);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const buildPageItems = (current: number, total: number, maxButtons = 7) => {
    if (maxButtons % 2 === 0) maxButtons += 1;
    if (total <= maxButtons)
      return Array.from({ length: total }, (_, i) => i + 1);
    const items: (number | "...")[] = [];
    const side = Math.floor(maxButtons / 2);
    let s = Math.max(2, current - side);
    let e = Math.min(total - 1, current + side);
    if (current <= side) {
      s = 2;
      e = maxButtons - 1;
    } else if (current > total - side) {
      s = total - (maxButtons - 2);
      e = total - 1;
    }
    items.push(1);
    if (s > 2) items.push("...");
    for (let i = s; i <= e; i++) items.push(i);
    if (e < total - 1) items.push("...");
    items.push(total);
    return items;
  };
  const pager =
    totalPages >= 2 ? buildPageItems(currentPage, totalPages, 7) : [];

  const goto = (p: number) => {
    if (totalPages < 2) return;
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <h2 className="text-2xl font-bold flex justify-center sm:justify-start">
        Kết quả xét nghiệm
      </h2>

      {/* search */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm mã phiếu, dịch vụ, bác sĩ..."
          className="border border-gray-300 rounded-sm px-4 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* table */}
      <div className="max-w-full mt-6 overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Mã phiếu</th>
              <th className="px-6 py-3">Ngày lấy mẫu</th>
              <th className="px-6 py-3">Dịch vụ</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.length ? (
              pageItems.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{r.result_code}</td>
                  <td className="px-6 py-3">{r.collected_at}</td>
                  <td className="px-6 py-3">{r.service_name}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Link
                      to="/user/lab-result/detail"
                      className="bg-primary-linear text-white text-sm px-3 py-2 rounded-[var(--rounded)]"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-600">
                  Không có kết quả
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination (>=2 trang mới hiện) */}
      {totalPages >= 2 && (
        <div className="flex items-center justify-between py-4">
          <p className="font-semibold px-4 text-black">
            Trang{" "}
            <span className="font-semibold text-black">{currentPage}</span> -{" "}
            <span className="font-semibold text-black">{totalPages}</span>
          </p>
          <div className="flex items-center px-4 xl:px-10 gap-2">
            {pager.map((it, idx) =>
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
                  onClick={() => goto(it as number)}
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
