import { useMemo, useState, useEffect, useCallback } from "react";
import { Check, X, Eye, Clock, Search } from "lucide-react";
import type {
  Appointment,
  AppointmentStatus,
} from "../../../types/appointment/appointment";

type Props = {
  items: Appointment[];
  perPage?: number;
  onView?: (id: number) => void;
  onSetStatus?: (id: number, status: AppointmentStatus) => void; // ưu tiên nếu có
  title?: string;
};

export default function AppointmentList({
  items,
  perPage = 6,
  onView,
  onSetStatus,
  title = "Danh sách chờ khám",
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  // lưu trạng thái tạm nếu parent chưa nối API
  const [tempStatus, setTempStatus] = useState<
    Record<number, AppointmentStatus>
  >({});

  const getStatus = useCallback(
    (id: number, fallback: AppointmentStatus) => tempStatus[id] ?? fallback,
    [tempStatus]
  );

  // hiển thị cả pending + booked là "chờ khám"
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = items.filter((p) => {
      const s = getStatus(p.id, p.status);
      return s === "pending" || s === "booked";
    });
    if (!q) return base;
    return base.filter(
      (p) =>
        p.patientName.toLowerCase().includes(q) ||
        p.patientPhone.includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        p.serviceName.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    );
  }, [items, query, getStatus]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    if (page > lastPage) setPage(1);
  }, [lastPage, page]);

  const setStatus = (id: number, status: AppointmentStatus) => {
    if (onSetStatus) onSetStatus(id, status);
    else setTempStatus((m) => ({ ...m, [id]: status }));
  };

  const renderBadge = (status: AppointmentStatus) => {
    const map: Record<AppointmentStatus, { text: string; cls: string }> = {
      pending: { text: "Đang chờ", cls: "bg-yellow-100 text-yellow-600" },
      booked: { text: "Đã đặt", cls: "bg-blue-100 text-blue-600" },
      done: { text: "Đã khám", cls: "bg-green-100 text-green-600" },
      cancelled: { text: "Đã huỷ", cls: "bg-red-100 text-red-600" },
    };
    const it = map[status];
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${it.cls}`}
      >
        {it.text}
      </span>
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold">{title}</h2>
          <span className="text-sm text-slate-500">
            ({filtered.length} lịch)
          </span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên, SĐT, mã lịch, bác sĩ, dịch vụ…"
            className="w-full rounded-lg border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </header>

      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-500 text-center text-white">
              <th className="py-2 pr-3">Mã hồ sơ</th>
              <th className="py-2 pr-3">Bệnh nhân</th>
              <th className="py-2 pr-3">Số điện thoại</th>
              <th className="py-2 pr-3">Bác sĩ</th>
              <th className="py-2 pr-3">Dịch vụ</th>
              <th className="py-2 pr-3">Ngày/Giờ</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3">Thời gian</th>
              <th className="py-2 pr-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  Không có lịch chờ khám.
                </td>
              </tr>
            )}

            {paged.map((a) => {
              const st = getStatus(a.id, a.status);
              return (
                <tr
                  key={a.id}
                  className="text-center border-b last:border-none"
                >
                  <td className="py-2 pr-3 font-medium">{a.code}</td>
                  <td className="py-2 pr-3">{a.patientName}</td>
                  <td className="py-2 pr-3">{a.patientPhone}</td>
                  <td className="py-2 pr-3">{a.doctorName}</td>
                  <td className="py-2 pr-3">{a.serviceName}</td>
                  <td className="py-2 pr-3">
                    {a.date} <span className="text-slate-400">/</span> {a.time}
                  </td>
                  <td className="py-2 pr-3">{renderBadge(st)}</td>
                  <td className="py-2 pr-3">
                    {new Date(a.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setStatus(a.id, "pending")}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-yellow-100 text-yellow-600 px-2 py-1 hover:bg-amber-100"
                        title="Chuyển sang Đang chờ"
                      >
                        Chờ
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "booked")}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-600 px-2 py-1 hover:bg-blue-100"
                        title="Chuyển sang Đã đặt"
                      >
                        <Check className="w-4 h-4" /> Đặt
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "done")}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-green-100 text-green-600 px-2 py-1 hover:bg-emerald-100"
                        title="Chuyển sang Đã khám"
                      >
                        Đã khám
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "cancelled")}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-red-100 text-red-600 px-2 py-1 hover:bg-rose-100"
                        title="Chuyển sang Đã huỷ"
                      >
                        <X className="w-4 h-4" /> Huỷ
                      </button>

                      <button
                        onClick={() => onView?.(a.id)}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-gray-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ListPagination
        total={filtered.length}
        perPage={perPage}
        page={page}
        setPage={setPage}
      />
    </section>
  );
}

/* Pagination tách nhỏ */
function ListPagination({
  total,
  perPage,
  page,
  setPage,
}: {
  total: number;
  perPage: number;
  page: number;
  setPage: (n: number) => void;
}) {
  const last = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Trang {Math.min(page, last)}/{last} — Tổng {total} lịch
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          Trước
        </button>
        <button
          onClick={() => setPage(Math.min(last, page + 1))}
          disabled={page === last}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
