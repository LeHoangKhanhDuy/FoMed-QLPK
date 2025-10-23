import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import type {
  Appointment,
  AppointmentStatus,
} from "../../../types/appointment/appointment";
import ConfirmModal from "../../../common/ConfirmModal";
import toast from "react-hot-toast";
import type { BEAppointment } from "../../../services/appointmentsApi";
import { useNavigate } from "react-router-dom";

type Props = {
  items: Array<Appointment | BEAppointment>;
  perPage?: number;
  onView?: (id: number) => void;
  onSetStatus?: (id: number, status: AppointmentStatus) => void;
  title?: string;
};

/** ==== Mapping/Nhãn trạng thái ==== */
const STATUS_LABEL: Record<AppointmentStatus, string> = {
  waiting: "Đang chờ",
  booked: "Đã đặt",
  done: "Đã khám",
  cancelled: "Hủy lịch",
  no_show: "Vắng mặt",
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  waiting: "bg-amber-100 text-amber-700",
  booked: "bg-sky-100 text-sky-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  no_show: "bg-slate-200 text-slate-700",
};

/** ==== Kiểu dữ liệu đã normalize để hiển thị ==== */
type Row = {
  id: number;
  code: string;
  status: AppointmentStatus;
  patientId?: number;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  serviceName?: string;
  date: string; // ISO yyyy-MM-dd
  time: string; // HH:mm:ss
  createdAt: string; // ISO
};


/** ==== Utils ==== */
const pad2 = (n: number) => String(n).padStart(2, "0");

const toDMY = (input: string) => {
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
  const [y, m, dd] = input.split("-");
  if (y && m && dd) return `${pad2(Number(dd))}/${pad2(Number(m))}/${y}`;
  return input;
};

type BEFlat = Pick<
  BEAppointment,
  | "appointmentId"
  | "code"
  | "status"
  | "visitDate"
  | "visitTime"
  | "patientId"
  | "patientName"
  | "patientPhone"
  | "doctorId"
  | "doctorName"
  | "serviceName"
  | "createdAt"
>;

function isBEFlat(x: unknown): x is BEFlat {
  return (
    typeof x === "object" &&
    x !== null &&
    "appointmentId" in x &&
    "visitDate" in x &&
    "visitTime" in x
  );
}

function isFEAppt(x: unknown): x is Appointment {
  return (
    typeof x === "object" &&
    x !== null &&
    "id" in x &&
    "date" in x &&
    "time" in x
  );
}

/** Nhận cả 2 kiểu: FE cũ (id/date/time) và BE mới (appointmentId/visitDate/visitTime) */
function normalizeAppointment(a: Appointment | BEFlat): Row {
  if (isFEAppt(a)) {
    // FE model đã map sẵn
    return {
      id: a.id,
      code: a.code,
      status: a.status,
      patientId: a.patientId,
      patientName: a.patientName,
      patientPhone: a.patientPhone,
      doctorName: a.doctorName,
      serviceName: a.serviceName,
      date: a.date, // yyyy-MM-dd
      time: a.time.length > 5 ? a.time.slice(0, 5) : a.time, // HH:mm
      createdAt: a.createdAt,
    };
  }

  if (isBEFlat(a)) {
    // Dữ liệu phẳng từ BE
    const hhmm = (a.visitTime || "").slice(0, 5);
    return {
      id: a.appointmentId,
      code: a.code || `BN${a.appointmentId}`,
      status: a.status,
      patientId: a.patientId,
      patientName: a.patientName || "Không rõ tên",
      patientPhone: a.patientPhone || "-",
      doctorName:
        a.doctorName || (a.doctorId ? `Bác sĩ #${a.doctorId}` : "Bác sĩ"),
      serviceName: a.serviceName || undefined,
      date: a.visitDate, // yyyy-MM-dd
      time: hhmm, // HH:mm
      createdAt: a.createdAt || new Date().toISOString(),
    };
  }

  // Fallback an toàn (không dùng any)
  return {
    id: 0,
    code: "",
    status: "waiting",
    patientName: "",
    patientPhone: "",
    doctorName: "",
    serviceName: undefined,
    date: "",
    time: "",
    createdAt: new Date().toISOString(),
  };
}

export default function AppointmentList({
  items,
  perPage = 6,
  onSetStatus,
  title = "Danh sách chờ khám",
}: Props) {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tempStatus, setTempStatus] = useState<
    Record<number, AppointmentStatus>
  >({});

  // Chuẩn hoá toàn bộ items ngay khi props đổi
  const rows = useMemo<Row[]>(() => items.map(normalizeAppointment), [items]);

  const gotoWorkspace = (row: Row) => {
    const pid = row.patientId ?? 0;
    nav(`/cms/patient-list/workspace?appointmentId=${row.id}&patientId=${pid}`);
  };

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pending, setPending] = useState<null | {
    id: number;
    next: AppointmentStatus;
  }>(null);

  // Lấy status ưu tiên local-temp (khi chưa call BE)
  const getStatus = useCallback(
    (id: number, fallback: AppointmentStatus) => tempStatus[id] ?? fallback,
    [tempStatus]
  );

  // Set status (gọi callback parent nếu có, nếu không thì set local)
  const setStatus = useCallback(
    (id: number, status: AppointmentStatus) => {
      if (onSetStatus) onSetStatus(id, status);
      else setTempStatus((prev) => ({ ...prev, [id]: status }));
    },
    [onSetStatus]
  );

  const doConfirm = async () => {
    if (!pending) return;
    setConfirmLoading(true);
    try {
      await Promise.resolve(setStatus(pending.id, pending.next));
      toast.success(
        pending.next === "cancelled"
          ? "Đã hủy lịch hẹn"
          : "Đã đánh dấu vắng mặt"
      );
      setConfirmOpen(false);
      setPending(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Error updating status:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  /** Filter: chỉ hiển thị waiting + booked, áp dụng search */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = rows.filter((p) => {
      const s = getStatus(p.id, p.status);
      return s === "waiting" || s === "booked";
    });

    if (!q) return base;

    return base.filter((p) => {
      const phone = p.patientPhone ?? "";
      return (
        p.patientName.toLowerCase().includes(q) ||
        String(phone).includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        (p.serviceName ?? "").toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    });
  }, [rows, query, getStatus]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));

  // Pagination
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // Reset page nếu vượt lastPage
  useEffect(() => {
    if (page > lastPage) setPage(1);
  }, [lastPage, page]);

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
              <th className="py-2 px-3">STT</th>
              <th className="py-2 px-3">Mã hồ sơ</th>
              <th className="py-2 px-3">Bệnh nhân</th>
              <th className="py-2 px-3">Số điện thoại</th>
              <th className="py-2 px-3">Bác sĩ</th>
              <th className="py-2 px-3">Dịch vụ</th>
              <th className="py-2 px-3">Lịch hẹn</th>
              <th className="py-2 px-3">Trạng thái</th>
              <th className="py-2 px-3">Thao tác</th>
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

            {paged.map((a, idx) => {
              const st = getStatus(a.id, a.status);
              const displayNo = (page - 1) * perPage + idx + 1;

              return (
                <tr
                  key={a.id}
                  className="text-center border-b last:border-none hover:bg-slate-50"
                >
                  <td className="py-2 px-3 font-medium">{displayNo}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => gotoWorkspace(a)}
                      className="text-sky-600 font-semibold hover:underline cursor-pointer"
                      title="Mở hồ sơ khám"
                    >
                      {a.code}
                    </button>
                  </td>
                  <td className="py-2 px-3 font-semibold">{a.patientName}</td>
                  <td className="py-2 px-3">{a.patientPhone}</td>
                  <td className="py-2 px-3">{a.doctorName}</td>
                  <td className="py-2 px-3">{a.serviceName ?? "-"}</td>
                  <td className="py-2 px-3">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{a.time}</span>
                      <span className="text-xs text-slate-500">
                        {toDMY(a.date)}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3">{renderBadge(st)}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-2">
                      {(st === "waiting" || st === "booked") && (
                        <button
                          onClick={() => gotoWorkspace(a)}
                          className="cursor-pointer px-2 py-1 rounded-md bg-primary-linear text-white text-xs"
                          title="Khám"
                        >
                          Khám
                        </button>
                      )}

                      <select
                        value={st}
                        onChange={async (e) => {
                          // 👈 async
                          const next = e.target.value as AppointmentStatus;
                          if (next === st) return;

                          if (next === "cancelled" || next === "no_show") {
                            setPending({ id: a.id, next });
                            setConfirmOpen(true);
                            return;
                          }

                          try {
                            if (onSetStatus)
                              await onSetStatus(a.id, next); // 👈 await hợp lệ
                            else setStatus(a.id, next);
                            toast.success(
                              `Đã cập nhật trạng thái thành "${STATUS_LABEL[next]}"`
                            );
                          } catch {
                            toast.error("Cập nhật trạng thái thất bại");
                          }
                        }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5 cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="booked">Đã đặt</option>
                        <option value="waiting">Đang chờ</option>
                        <option value="done">Đã khám</option>
                        <option value="cancelled">Hủy lịch</option>
                        <option value="no_show">Vắng mặt</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
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
            ? "Bạn có chắc muốn hủy lịch hẹn này? Hành động này không thể hoàn tác."
            : "Bạn có chắc muốn đánh dấu bệnh nhân này vắng mặt? Hành động này không thể hoàn tác."
        }
        confirmText={pending?.next === "cancelled" ? "Hủy lịch" : "Xác nhận"}
        cancelText="Đóng"
        danger
      />

      {/* Pagination */}
      <ListPagination
        total={filtered.length}
        perPage={perPage}
        page={page}
        setPage={setPage}
      />
    </section>
  );
}

/* Pagination Component */
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
        Trang {Math.min(page, last)} / {last}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPage(Math.min(last, page + 1))}
          disabled={page === last}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
