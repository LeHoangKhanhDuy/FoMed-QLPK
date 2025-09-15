import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import type {
  Appointment,
  AppointmentStatus,
} from "../../../types/appointment/appointment";
import ConfirmModal from "../../../common/ConfirmModal";

type Props = {
  items: Appointment[];
  perPage?: number;
  onView?: (id: number) => void;
  onSetStatus?: (id: number, status: AppointmentStatus) => void;
  title?: string;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  waiting: "Đang chờ",
  booked: "Đã đặt",
  done: "Đã khám",
  cancelled: "Hủy lịch",
  no_show: "Vắng mặt",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const toDMY = (input: string) => {
  // ưu tiên parse theo Date; nếu fail thì tách theo '-'
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
  const [y, m, dd] = input.split("-");
  if (y && m && dd) return `${pad2(Number(dd))}/${pad2(Number(m))}/${y}`;
  return input; // fallback nguyên bản
};


const STATUS_BADGE: Record<AppointmentStatus, string> = {
  waiting: "bg-amber-100 text-amber-700",
  booked: "bg-sky-100 text-sky-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  no_show: "bg-slate-200 text-slate-700",
};

export default function AppointmentList({
  items,
  perPage = 6,
  onSetStatus,
  title = "Danh sách chờ khám",
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tempStatus, setTempStatus] = useState<Record<number, AppointmentStatus>>({});
  // ---- state cho ConfirmModal ----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pending, setPending] = useState<null | { id: number; next: AppointmentStatus }>(null);

  const getStatus = useCallback(
    (id: number, fallback: AppointmentStatus) => tempStatus[id] ?? fallback,
    [tempStatus]
  );
  
  // const setStatus = (id: number, status: AppointmentStatus) => {
  //   if (onSetStatus) onSetStatus(id, status);
  //   else setTempStatus((m) => ({ ...m, [id]: status }));
  // };

  const doConfirm = async () => {
    if (!pending) return;
    setConfirmLoading(true);
    try {
      // dùng hàm chung để set (hỗ trợ cả khi có onSetStatus)
      await Promise.resolve(setStatus(pending.id, pending.next));
      setConfirmOpen(false);
      setPending(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  // “chờ khám” = waiting + booked
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = items.filter((p) => {
      const s = getStatus(p.id, p.status);
      return s === "waiting" || s === "booked";
    });
    if (!q) return base;
    return base.filter(
      (p) =>
        p.patientName.toLowerCase().includes(q) ||
        p.patientPhone.includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        (p.serviceName ?? "").toLowerCase().includes(q) ||
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

  const renderBadge = (status: AppointmentStatus) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );

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
            <tr className="bg-sky-400 text-center text-white">
              <th className="py-2 pr-3">STT</th>
              <th className="py-2 pr-3">Mã hồ sơ</th>
              <th className="py-2 pr-3">Bệnh nhân</th>
              <th className="py-2 pr-3">Số điện thoại</th>
              <th className="py-2 pr-3">Bác sĩ</th>
              <th className="py-2 pr-3">Dịch vụ</th>
              <th className="py-2 pr-3">Đặt lịch</th>
              <th className="py-2 pr-3">Thời gian</th>
              <th className="py-2 pr-3">Trạng thái</th>
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
                  <td className="py-2 pr-3">#{a.id}</td>
                  <td className="py-2 pr-3">{a.code}</td>
                  <td className="py-2 pr-3 font-bold">{a.patientName}</td>
                  <td className="py-2 pr-3">{a.patientPhone}</td>
                  <td className="py-2 pr-3">{a.doctorName}</td>
                  <td className="py-2 pr-3">{a.serviceName ?? "-"}</td>
                  <td className="py-2 pr-3">
                    {a.time}
                    <span className="text-slate-400"> - </span>
                    {toDMY(a.date)}
                  </td>
                  <td className="py-2 pr-3">
                    {new Date(a.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-3">{renderBadge(st)}</td>
                  <td className="py-2 pr-3">
                    <select
                      value={st}
                      onChange={(e) => {
                        const next = e.target.value as AppointmentStatus;
                        if (next === st) return;

                        if (next === "cancelled" || next === "no_show") {
                          setPending({ id: a.id, next });
                          setConfirmOpen(true);
                          return;
                        }
                        setStatus(a.id, next);
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5 cursor-pointer"
                    >
                      <option value="booked">Đã đặt</option>
                      <option value="waiting">Đang chờ</option>
                      <option value="done">Đã khám</option>
                      <option value="cancelled">Hủy lịch</option>
                      <option value="no_show">Vắng mặt</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPending(null);
        }}
        onConfirm={doConfirm}
        loading={confirmLoading}
        title={
          pending?.next === "cancelled"
            ? "Xác nhận Hủy lịch hẹn"
            : "Đánh dấu vắng mặt"
        }
        description={
          pending?.next === "cancelled"
            ? "Bạn có chắc muốn hủy lịch hẹn này!"
            : "Bạn có chắc muốn đánh dấu bệnh nhân này vắng mặt!"
        }
        confirmText={pending?.next === "cancelled" ? "Hủy lịch" : "Xác nhận"}
        cancelText="Đóng"
        danger
      />

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
        Trang {Math.min(page, last)} - {last}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft/>
        </button>
        <button
          onClick={() => setPage(Math.min(last, page + 1))}
          disabled={page === last}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight/>
        </button>
      </div>
    </div>
  );
}
