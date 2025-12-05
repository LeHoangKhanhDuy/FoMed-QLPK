// pages/UserAppointmentsPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  patientSchedule,
  type BEAppointment,
  type BEAppointmentStatus,
} from "../../services/appointmentsApi";
import SkeletonRow from "../../Utils/SkeletonRow";

export default function AppointmentSchedule() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BEAppointment[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientSchedule({
        page,
        limit,
      });
      // Sort items so newest visit datetime (date + time) appears first
      const toDate = (it: BEAppointment) => {
        const date = it.visitDate ?? "";
        const time = it.visitTime ?? "00:00";
        // Construct an ISO-like string. If either is missing, Date will handle it.
        return new Date(`${date}T${time}`);
      };
      const sorted = (data.items ?? []).slice().sort((a, b) => {
        return +toDate(b) - +toDate(a);
      });
      setItems(sorted);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
      setItems([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const kw = searchTerm.trim().toLowerCase();
    return items.filter((a) =>
      [
        a.code,
        a.doctorName ?? "",
        a.serviceName ?? "",
        a.patientName ?? "",
        a.patientPhone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(kw)
    );
  }, [items, searchTerm]);

  // Xử lý đổi trang
  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render trạng thái
  const renderStatusBadge = (s?: BEAppointmentStatus) => {
    switch (s) {
      case "waiting":
        return (
          <span className="px-2 py-1 rounded-[var(--rounded)] text-xs font-semibold bg-yellow-100 text-yellow-600">
            Đã đến
          </span>
        );
      case "booked":
        return (
          <span className="px-2 py-1 rounded-[var(--rounded)] text-xs font-semibold bg-sky-100 text-sky-600">
            Đã đặt
          </span>
        );
      case "done":
        return (
          <span className="px-2 py-1 rounded-[var(--rounded)] text-xs font-semibold bg-green-100 text-green-600">
            Đã khám
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 rounded-[var(--rounded)] text-xs font-semibold bg-red-100 text-red-600">
            Đã huỷ
          </span>
        );
      case "no_show":
        return (
          <span className="px-2 py-1 rounded-[var(--rounded)] text-xs font-semibold bg-gray-100 text-gray-600">
            Vắng
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
            —
          </span>
        );
    }
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        // try basic YYYY-MM-DD parsing if Date failed
        const parts = dateStr.split("T")[0].split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
      }
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <h2 className="text-2xl font-bold text-center md:text-left">
        Lịch khám của tôi
      </h2>

      {/* Ô tìm kiếm */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Tìm lịch khám..."
          className="border border-gray-300 rounded-[var(--rounded)] px-4 py-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="max-w-full mt-6 overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3 text-center">Ngày khám</th>
              <th className="px-6 py-3">Thứ tự khám</th>
              <th className="px-6 py-3 text-center">Bác sĩ</th>
              <th className="px-6 py-3 text-center">Dịch vụ</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={5} />
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((a) => (
                <tr key={a.appointmentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {a.appointmentId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>{formatDateString(a.visitDate) || "-"}</div>
                    <div className="text-xs text-slate-500">{a.visitTime}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-center text-gray-800">
                    {a.queueNo ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {a.doctorName ?? `BS #${a.doctorId}`}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {a.serviceName ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderStatusBadge(a.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Không có lịch khám
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages >= 2 && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          <p className="font-semibold px-4 text-black text-sm sm:text-base">
            Trang <span className="font-bold text-sky-600">{page}</span> /{" "}
            <span className="font-bold text-sky-600">{totalPages}</span> — Tổng{" "}
            {total} lịch
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className={`px-3 py-1 rounded text-sm ${
                page <= 1
                  ? "opacity-50 cursor-not-allowed bg-gray-100"
                  : "hover:bg-sky-50 border"
              }`}
            >
              Prev
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-full text-sm transition ${
                    p === page
                      ? "bg-sky-500 text-white"
                      : "bg-white border border-slate-300 hover:border-sky-500 hover:text-sky-600"
                  }`}
                >
                  {p}
                </button>
              );
            }).filter((btn) => btn.key !== null)}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded text-sm ${
                page >= totalPages
                  ? "opacity-50 cursor-not-allowed bg-gray-100"
                  : "hover:bg-sky-50 border"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
