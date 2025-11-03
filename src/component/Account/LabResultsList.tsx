import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetLabResults } from "../../services/labResultsApi";
import {
  normalizeLabStatus,
  type LabStatus,
} from "../../Utils/normalizeLabStatus";

// Giữ nguyên StatusBadge như bạn đã có
const StatusBadge = ({ status }: { status?: string | LabStatus }) => {
  const s = normalizeLabStatus(status ?? "");
  const map: Record<LabStatus, { cls: string; text: string }> = {
    pending: { cls: "bg-yellow-100 text-yellow-700", text: "Chờ xử lý" },
    processing: { cls: "bg-blue-100 text-blue-500", text: "Đang xử lý" },
    completed: { cls: "bg-green-100 text-green-600", text: "Bình thường" }, // hoặc "Hoàn tất"
    abnormal: { cls: "bg-red-100 text-red-600", text: "Bất thường" },
    canceled: { cls: "bg-gray-200 text-gray-600", text: "Đã hủy" },
  };
  const m = map[s]; // luôn có vì đã normalize
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${m.cls}`}
    >
      {m.text}
    </span>
  );
};

type Row = {
  id: number; // tạo tạm để key, từ offset trang + index
  result_code: string;
  collected_at: string;
  service_name: string;
  status: LabStatus;
};

export default function LabResultsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Row[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Tải dữ liệu khi đổi trang
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiGetLabResults({
          page: currentPage,
          limit: pageSize,
          // Nếu là ADMIN/DOCTOR muốn xem theo bệnh nhân khác:
          // patientId: ...,  // hoặc
          // patientCode: "BN000567",
        });

        if (cancelled) return;

        // map BE -> Row (BE không trả id nên tạo id tạm)
        const offset = (res.page - 1) * res.limit;
        const mapped: Row[] = res.items.map((it, idx) => ({
          id: offset + idx + 1,
          result_code: it.code,
          collected_at: it.sampleTakenAt ? it.sampleTakenAt : "",
          service_name: it.serviceName,
          status: it.status,
        }));

        setItems(mapped);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // Search (lọc trong trang hiện tại)
  const pageItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [r.result_code, r.collected_at, r.service_name, String(r.status)].join(" "));
  }, [items, searchTerm]);

  // Helper pager
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

      {/* state */}
      {error && (
        <div className="mt-4 text-red-600 bg-red-50 rounded-sm px-4 py-2">
          {error}
        </div>
      )}
      {loading && <div className="mt-4 text-slate-600">Đang tải dữ liệu…</div>}

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
                  <td className="px-6 py-3">
                    {r.collected_at
                      ? new Date(r.collected_at).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-6 py-3">{r.service_name}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Link
                      to={`/user/lab-result/detail?code=${encodeURIComponent(
                        r.result_code
                      )}`}
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
                  {loading ? " " : "Không có kết quả"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages >= 2 && (
        <div className="flex items-center justify-between py-4">
          <p className="font-semibold px-4 text-black">
            Trang{" "}
            <span className="font-semibold text-black">{currentPage}</span> -{" "}
            <span className="font-semibold text-black">{totalPages}</span>{" "}
            <span className="text-slate-500">({totalItems} mục)</span>
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
