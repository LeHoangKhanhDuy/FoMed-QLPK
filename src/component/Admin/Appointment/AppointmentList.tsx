import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import type {
  Appointment,
  AppointmentStatus,
} from "../../../types/appointment/appointment";
import ConfirmModal from "../../../common/ConfirmModal";
import toast from "react-hot-toast";
import type { BEAppointment } from "../../../services/appointmentsApi";
import { updateAppointmentStatus } from "../../../services/appointmentsApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/auth";

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
  date: string;
  time: string;
  createdAt: string;
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

function normalizeAppointment(a: Appointment | BEFlat): Row {
  if (isFEAppt(a)) {
    return {
      id: a.id,
      code: a.code,
      status: a.status,
      patientId: a.patientId,
      patientName: a.patientName,
      patientPhone: a.patientPhone,
      doctorName: a.doctorName,
      serviceName: a.serviceName,
      date: a.date,
      time: a.time.length > 5 ? a.time.slice(0, 5) : a.time,
      createdAt: a.createdAt,
    };
  }

  if (isBEFlat(a)) {
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
      date: a.visitDate,
      time: hhmm,
      createdAt: a.createdAt || new Date().toISOString(),
    };
  }

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
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const rows = useMemo<Row[]>(() => items.map(normalizeAppointment), [items]);
  const { hasRole } = useAuth();
  const isDoctor = hasRole("DOCTOR");

  // Kiểm tra quyền truy cập workspace trước khi navigate
  const gotoWorkspace = useCallback(
    (row: Row) => {
      if (loadingWorkspace) return;
      setLoadingWorkspace(true);

      try {
        const pid = row.patientId ?? 0;

        // Dùng hasRole từ context → chính xác, an toàn
        if (!hasRole("DOCTOR")) {
          toast.error("Chỉ có bác sĩ mới có quyền truy cập", {
            duration: 4000,
            position: "top-center",
          });
          setLoadingWorkspace(false);
          return;
        }

        // Nếu là DOCTOR → navigate
        nav(
          `/cms/patient-list/workspace?appointmentId=${row.id}&patientId=${pid}`
        );
      } catch (error) {
        toast.error("Có lỗi xảy ra khi mở hồ sơ");
        console.error("Workspace navigation error:", error);
      } finally {
        setLoadingWorkspace(false);
      }
    },
    [nav, loadingWorkspace, hasRole]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pending, setPending] = useState<null | {
    id: number;
    next: AppointmentStatus;
  }>(null);
  const [markingWaiting, setMarkingWaiting] = useState<number | null>(null);

  const getStatus = useCallback(
    (id: number, fallback: AppointmentStatus) => tempStatus[id] ?? fallback,
    [tempStatus]
  );

  const setStatus = useCallback(
    (id: number, status: AppointmentStatus) => {
      if (onSetStatus) onSetStatus(id, status);
      else setTempStatus((prev) => ({ ...prev, [id]: status }));
    },
    [onSetStatus]
  );

  const handleMarkWaiting = useCallback(
    async (appointmentId: number) => {
      try {
        setMarkingWaiting(appointmentId);
        await updateAppointmentStatus(appointmentId, "waiting");
        setStatus(appointmentId, "waiting");
        toast.success("Đã ghi nhận bệnh nhân đã đến");
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      } finally {
        setMarkingWaiting(null);
      }
    },
    [setStatus]
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const allowed = isDoctor ? ["waiting"] : ["booked", "waiting"];
    const base = rows.filter((p) => {
      const s = getStatus(p.id, p.status);
      return allowed.includes(s);
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
  }, [rows, query, getStatus, isDoctor]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

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
                      disabled={loadingWorkspace}
                      className="text-sky-600 font-semibold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {hasRole("DOCTOR") ? (
                        <button
                          onClick={() => gotoWorkspace(a)}
                          disabled={loadingWorkspace}
                          className="cursor-pointer px-2 py-2 rounded-[var(--rounded)] bg-primary-linear text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingWorkspace ? "Đang mở..." : "Khám bệnh"}
                        </button>
                      ) : (
                        <button
                          className={`px-2 py-2 rounded-[var(--rounded)] text-sm text-white transition ${
                            st === "waiting"
                              ? "bg-gray-400 cursor-not-allowed"
                              : markingWaiting === a.id
                              ? "bg-slate-500"
                              : "bg-sky-500 hover:bg-sky-600"
                          }`}
                          disabled={markingWaiting === a.id || st === "waiting"}
                          onClick={() => handleMarkWaiting(a.id)}
                        >
                          {st === "waiting"
                            ? "Đã đến"
                            : markingWaiting === a.id
                            ? "Đang xử lý"
                            : "Đánh dấu đã đến"}
                        </button>
                      )}
                    </div>
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
            ? "Bạn có chắc muốn hủy lịch hẹn này? Hành động này không thể hoàn tác."
            : "Bạn có chắc muốn đánh dấu bệnh nhân này vắng mặt? Hành động này không thể hoàn tác."
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
