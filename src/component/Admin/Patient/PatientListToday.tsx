import { useEffect, useMemo, useState } from "react";
import { Search, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export type AppointmentStatus =
  | "waiting"
  | "booked"
  | "done"
  | "cancelled"
  | "no_show";

type Props = {
  // Cho phép truyền từ PatientTodayRow | Appointment (FE) | BEAppointment (phẳng)
  items: Array<unknown>;
  perPage?: number;
  title?: string;
};

type Row = {
  id: number;
  code: string;
  name: string;
  phone?: string | number | null;
  doctorName: string;
  serviceName: string;
  visitDate: string; // yyyy-MM-dd
  visitTime: string; // HH:mm
  statusLabel:
    | "Đang chờ"
    | "Đã đặt"
    | "Đã khám"
    | "Đã hủy"
    | "Vắng mặt"
    | string;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  waiting: "Đang chờ",
  booked: "Đã đặt",
  done: "Đã khám",
  cancelled: "Đã hủy",
  no_show: "Vắng mặt",
};

/* ========= Utils: lấy giá trị theo nhiều key ứng viên ========= */
function getVal<T = unknown>(
  obj: Record<string, unknown>,
  keys: string[],
  fallback?: T
): T {
  for (const k of keys) {
    if (k in obj) return obj[k] as T;
    const alt = Object.keys(obj).find(
      (x) => x.toLowerCase() === k.toLowerCase()
    );
    if (alt) return obj[alt] as T;
  }
  return fallback as T;
}
const asNum = (v: unknown, fb = 0) =>
  (typeof v === "number" ? v : Number(v ?? fb)) || fb;
const asStr = (v: unknown, fb = "") => (v == null ? fb : String(v));
const hhmm = (t: unknown) => {
  const s = asStr(t, "");
  if (!s) return "";
  // có thể là "15:00:00" hoặc "15:00"
  return s.length >= 5 ? s.slice(0, 5) : s;
};
const formatISO = (d?: string) => {
  if (!d) return "-";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  return `${day}/${m}/${y}`;
};
const statusClass = (s: Row["statusLabel"]) => {
  const map: Record<string, string> = {
    "Đang chờ": "bg-amber-100 text-amber-700",
    "Đã đặt": "bg-sky-100 text-sky-700",
    "Đã khám": "bg-emerald-100 text-emerald-700",
    "Đã hủy": "bg-rose-100 text-rose-700",
    "Vắng mặt": "bg-slate-200 text-slate-700",
  };
  return map[s] ?? "bg-slate-100 text-slate-700";
};

/* ========= Normalizer “bắt mọi kiểu” ========= */
function normalizeItem(x: unknown): Row {
  if (!x || typeof x !== "object") {
    return {
      id: 0,
      code: "",
      name: "",
      phone: "-",
      doctorName: "",
      serviceName: "-",
      visitDate: "",
      visitTime: "",
      statusLabel: "Đang chờ",
    };
  }
  const r = x as Record<string, unknown>;

  // ---- Các key ứng viên cho mỗi trường (chấp nhận camel/Pascal/snake) ----
  const id =
    asNum(
      getVal(r, [
        "id",
        "appointmentId",
        "appointmentID",
        "AppointmentId",
        "AppointmentID",
      ])
    ) || 0;

  const code = asStr(getVal(r, ["code", "Code"]), id ? `BN${id}` : "");

  const name = asStr(
    getVal(r, ["name", "patientName", "PatientName"]),
    "Không rõ tên"
  );

  const phone = getVal<string | number | null>(
    r,
    ["phone", "patientPhone", "Phone", "PatientPhone"],
    "-"
  );

  // Format số điện thoại đúng cách
  const formatPhone = (phoneValue: string | number | null): string => {
    if (!phoneValue || phoneValue === "-") return "-";
    
    const phoneStr = String(phoneValue).replace(/\D/g, ""); // Chỉ giữ số
    if (phoneStr.length === 0) return "-";
    
    // Format số điện thoại Việt Nam
    if (phoneStr.length === 10 && phoneStr.startsWith("0")) {
      return phoneStr.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    
    // Format số điện thoại quốc tế
    if (phoneStr.length === 11 && phoneStr.startsWith("84")) {
      return phoneStr.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, "+$1 $2 $3 $4");
    }
    
    // Trả về nguyên gốc nếu không match format nào
    return String(phoneValue);
  };

  const formattedPhone = formatPhone(phone);

  const doctorName =
    asStr(getVal(r, ["doctorName", "DoctorName"])) ||
    (asNum(getVal(r, ["doctorId", "DoctorId"]))
      ? `Bác sĩ #${asNum(getVal(r, ["doctorId", "DoctorId"]))}`
      : "Bác sĩ");

  const serviceName = asStr(getVal(r, ["serviceName", "ServiceName"]), "-");

  const visitDate = asStr(
    getVal(r, ["visitDate", "VisitDate", "date", "Date"]),
    ""
  );
  const visitTime = hhmm(
    getVal(r, ["visitTime", "VisitTime", "time", "Time"], "")
  );

  // PatientTodayRow đã sẵn statusLabel; Appointment/BE có status
  const statusRaw =
    getVal<string>(r, ["statusLabel"]) ||
    getVal<string>(r, ["status", "Status"], "waiting");

  const statusLabel =
    STATUS_LABEL[statusRaw as AppointmentStatus] ??
    asStr(statusRaw, "Đang chờ");

  return {
    id,
    code,
    name,
    phone: formattedPhone,
    doctorName,
    serviceName,
    visitDate,
    visitTime,
    statusLabel,
  };
}

/* ======================= Component ======================= */
export default function PatientListToday({
  items,
  perPage = 8,
  title = "Danh sách chờ khám",
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const rows = useMemo<Row[]>(() => items.map(normalizeItem), [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        String(p.phone ?? "").includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        (p.serviceName ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    if (page > lastPage) setPage(1);
  }, [lastPage, page]);

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

        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên, SĐT, mã lịch, bác sĩ, dịch vụ…"
            className="w-full rounded-[var(--rounded)] border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </header>

      <div className="overflow-x-auto rounded-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-sky-400 text-white">
              <th className="px-3 py-2 text-left">STT</th>
              <th className="px-3 py-2 text-left">Mã hồ sơ</th>
              <th className="px-3 py-2 text-left">Bệnh nhân</th>
              <th className="px-3 py-2 text-left">Số điện thoại</th>
              <th className="px-3 py-2 text-left">Bác sĩ</th>
              <th className="px-3 py-2 text-left">Dịch vụ</th>
              <th className="px-3 py-2">Lịch hẹn</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  Không có lịch phù hợp.
                </td>
              </tr>
            )}

            {paged.map((p, idx) => {
              const stt = (page - 1) * perPage + idx + 1;
              return (
                <tr
                  key={`${p.id}-${idx}`}
                  className="text-center border-b last:border-none"
                >
                  <td className="px-3 py-2 text-left font-medium">{stt}</td>
                  <td className="px-3 py-2 text-left">
                    <Link
                      to={`/cms/patients/${p.code}`}
                      className="cursor-pointer text-sky-600 hover:underline"
                      title="Xem hồ sơ"
                    >
                      {p.code || "-"}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-left font-semibold">
                    {p.name || "-"}
                  </td>
                  <td className="px-3 py-2 text-left">{p.phone ?? "-"}</td>
                  <td className="px-3 py-2 text-left">{p.doctorName || "-"}</td>
                  <td className="px-3 py-2 text-left">
                    {p.serviceName || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="leading-tight">
                      <div className="font-semibold">
                        {p.visitTime || "--:--"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatISO(p.visitDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass(
                        p.statusLabel
                      )}`}
                    >
                      {p.statusLabel}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <Link
                      to="/cms/patient-list/workspace"
                      className="cursor-pointer inline-flex items-center gap-1 rounded-[var(--rounded)] border px-2 py-1 hover:bg-gray-50"
                      title="Khám bệnh"
                    >
                      Khám bệnh
                    </Link>
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

/* Pagination */
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
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => setPage(Math.min(last, page + 1))}
          disabled={page === last}
          className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
