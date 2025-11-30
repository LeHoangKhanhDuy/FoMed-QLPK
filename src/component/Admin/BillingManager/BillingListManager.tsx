import { useEffect, useState, useRef } from "react";
import { Plus, Search, Funnel, Wallet, RefreshCw } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { type PaymentMethod } from "../../../types/billing/billing";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";
import {
  apiInvoiceList,
  apiCompletedVisitsPendingBilling,
  type BEInvoiceListRow,
  type BEPendingRow,
} from "../../../services/billingApi";

// trạng thái filter bên UI
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Nháp", label: "Nháp" },
  { value: "Đã thanh toán", label: "Đã thanh toán" },
  { value: "Chưa thanh toán", label: "Chưa thanh toán" },
  { value: "Hoàn tiền", label: "Hoàn tiền" },
  { value: "Hủy", label: "Huỷ" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];

const STATUS_SELECT_OPTS: SelectOption<StatusFilter>[] = STATUS_OPTIONS.map(
  (o) => ({
    value: o.value,
    label: o.label,
  })
);

function InvoiceStatusBadge({ status }: { status: string | undefined | null }) {
  // chuẩn hoá tạm chuỗi status để khớp key
  const normalized =
    status && status.trim().length > 0 ? status.trim() : "unknown";

  // mapping màu cho các trạng thái mình support
  const mapCls: Record<string, string> = {
    Nháp: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    "Đã thanh toán": "bg-green-50 text-green-600 ring-1 ring-green-200",
    "Chưa thanh toán": "bg-red-50 text-red-600 ring-1 ring-red-200",
    "Hoàn tiền": "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    Hủy: "bg-red-50 text-red-600 ring-1 ring-red-200",
    Huỷ: "bg-red-50 text-red-600 ring-1 ring-red-200",
    Paid: "bg-green-50 text-green-600 ring-1 ring-green-200",
    Unpaid: "bg-red-50 text-red-600 ring-1 ring-red-200",
  };

  const cls =
    mapCls[normalized] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-300";

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-[var(--rounded)] text-xs font-medium ring-1 ${cls}`}
    >
      {status ?? "-"}
    </span>
  );
}

// Ánh xạ BE -> FE cho payment method để dùng badge UI
// BE có thể trả "cash" | "card" | "transfer" | "e-wallet" | null
function normalizeMethod(m: string | null): PaymentMethod | null {
  if (!m) return null;
  const val = m.toLowerCase();
  if (val.includes("wallet") || val.includes("e-wallet")) return "wallet";
  if (val.includes("cash") || val.includes("tiền")) return "cash";
  if (val.includes("card") || val.includes("thẻ")) return "card";
  if (val.includes("transfer") || val.includes("khoản")) return "transfer";
  return null;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Tiền mặt",
  card: "Thẻ ngân hàng",
  transfer: "Chuyển khoản",
  wallet: "Ví điện tử",
};

function MethodBadge({ m }: { m: PaymentMethod }) {
  const base =
    "px-2 py-0.5 rounded-[var(--rounded)] text-xs font-medium ring-1";
  const cls =
    m === "cash"
      ? "bg-emerald-50 text-emerald-500 ring-emerald-200"
      : m === "card"
      ? "bg-indigo-50 text-indigo-500 ring-indigo-200"
      : m === "transfer"
      ? "bg-sky-50 text-sky-500 ring-sky-200"
      : "bg-pink-50 text-pink-500 ring-pink-200";
  return <span className={`${base} ${cls}`}>{METHOD_LABEL[m]}</span>;
}

const cx = (...a: Array<string | false | undefined>) =>
  a.filter(Boolean).join(" ");

/* ================= Component ================= */

export default function BillingListManager() {
  const nav = useNavigate();
  const location = useLocation();
  const prevLocationRef = useRef<string>(location.pathname);
  const lastRefreshTimeRef = useRef<number>(0);
  // tab hiện tại
  const [tab, setTab] = useState<"invoices" | "pending">("pending");
  // filter
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  // data
  const [invoiceRows, setInvoiceRows] = useState<BEInvoiceListRow[]>([]);
  const [pending, setPending] = useState<BEPendingRow[]>([]);
  const [loading, setLoading] = useState(false);

  // load danh sách hóa đơn (tab "invoices")
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await apiInvoiceList({ q, status });
      setInvoiceRows(data);
    } catch (err) {
      console.error("loadInvoices error:", err);
      setInvoiceRows([]);
    } finally {
      setLoading(false);
    }
  };

  // load danh sách chờ thanh toán (tab "pending")
  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await apiCompletedVisitsPendingBilling();
      setPending(data);
    } catch (err) {
      console.error("loadPending error:", err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  // tự động load khi chuyển tab hoặc đổi trạng thái filter
  useEffect(() => {
    if (tab === "invoices") {
      loadInvoices();
    } else {
      loadPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, status]);

  // Tự động refresh khi quay lại từ trang thanh toán hoặc các trang khác
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current;
    
    // Nếu quay lại trang billing từ trang payment hoặc details
    if (
      currentPath === "/cms/billing" &&
      prevPath !== currentPath &&
      (prevPath?.includes("/cms/billing/payment") ||
        prevPath?.includes("/cms/billing/details") ||
        prevPath?.includes("/cms/billing/new"))
    ) {
      // Refresh dữ liệu khi quay lại
      if (tab === "invoices") {
        loadInvoices();
      } else {
        loadPending();
      }
    }
    
    prevLocationRef.current = currentPath;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, tab]);

  // Refresh khi tab/window được focus lại (với debounce để tránh refresh quá thường xuyên)
  useEffect(() => {
    const MIN_REFRESH_INTERVAL = 5000; // 5 giây

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        // Chỉ refresh nếu đã qua ít nhất 5 giây kể từ lần refresh cuối
        if (now - lastRefreshTimeRef.current > MIN_REFRESH_INTERVAL) {
          lastRefreshTimeRef.current = now;
          // Refresh dữ liệu khi tab được focus lại
          if (tab === "invoices") {
            loadInvoices();
          } else {
            loadPending();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-sky-500" />
          <h1 className="text-xl font-bold">Quản lý thanh toán</h1>
        </div>
        <button
          onClick={() => {
            if (tab === "invoices") {
              loadInvoices();
            } else {
              loadPending();
            }
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--rounded)] border bg-white hover:bg-slate-50 cursor-pointer"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </header>

      <div className="rounded-xl border bg-white p-4 shadow-xs space-y-3">
        {/* Tabs */}
        <div className="flex flex-col-2 gap-2">
          <button
            onClick={() => setTab("pending")}
            className={cx(
              "w-full sm:w-auto h-10 px-3 font-semibold rounded-[var(--rounded)] border cursor-pointer",
              tab === "pending" && "bg-sky-50 border-sky-400 text-sky-500"
            )}
          >
            Chờ thanh toán
          </button>
          <button
            onClick={() => setTab("invoices")}
            className={cx(
              "w-full sm:w-auto h-10 px-3 font-semibold rounded-[var(--rounded)] border cursor-pointer",
              tab === "invoices" && "bg-sky-50 border-sky-400 text-sky-500"
            )}
          >
            Danh sách hoá đơn
          </button>
        </div>

        {tab === "invoices" ? (
          <>
            {/* Filter khu vực hoá đơn */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              {/* trái: ô search + trạng thái + nút lọc */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <label className="relative w-full sm:w-80">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-7 -translate-y-1/2" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadInvoices()}
                    placeholder="Tìm mã hoá đơn / tên bệnh nhân…"
                    className={cx(
                      "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 text-left shadow-xs outline-none",
                      "pl-9 pr-10",
                      "focus:ring-2 focus:ring-sky-500"
                    )}
                  />
                </label>

                <SelectMenu
                  value={status}
                  onChange={(v) => {
                    if (v !== "") setStatus(v as StatusFilter);
                  }}
                  options={STATUS_SELECT_OPTS}
                  className="w-full sm:w-[180px]"
                />

                {/* nút lọc (desktop) */}
                <button
                  onClick={loadInvoices}
                  className={cx(
                    "hidden sm:inline-flex mt-1 h-12 px-4 items-center justify-center",
                    "rounded-[var(--rounded)] border bg-white/90 text-[16px] leading-6 shadow-xs cursor-pointer",
                    "hover:bg-slate-50"
                  )}
                  title="Lọc"
                >
                  <Funnel className="w-4 h-4 mr-2" />
                  <span>Lọc</span>
                </button>
              </div>

              {/* phải: tạo hoá đơn desktop */}
              {/* <button
                onClick={() => nav("/cms/billing/new")}
                className="hidden sm:inline-flex cursor-pointer h-12 px-4 items-center justify-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white whitespace-nowrap shrink-0"
              >
                + Tạo hoá đơn
              </button> */}

              {/* mobile: gộp Lọc + Tạo hoá đơn */}
              <div className="grid grid-cols-2 gap-2 w-full sm:hidden">
                <button
                  onClick={loadInvoices}
                  className="h-12 px-3 sm:inline-flex items-center gap-2 rounded-[var(--rounded)] border cursor-pointer w-full inline-flex items-center justify-center"
                  title="Lọc"
                >
                  <Funnel className="w-4 h-4" />
                  <span>Lọc</span>
                </button>

                <button
                  onClick={() => nav("/cms/billing/new")}
                  className="cursor-pointer h-12 px-3 inline-flex items-center justify-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white w-full whitespace-nowrap shrink-0 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tạo hoá đơn
                </button>
              </div>
            </div>

            {/* Bảng hoá đơn */}
            <div className="overflow-x-auto rounded-sm border border-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-sky-400 text-center text-white">
                    <th className="py-2 pr-3">STT</th>
                    <th className="py-2 pr-3">Mã hồ sơ</th>
                    <th className="py-2 pr-3">Bệnh nhân</th>
                    <th className="py-2 pr-3">Ngày</th>
                    <th className="py-2 pr-3">Đã thu</th>
                    <th className="py-2 pr-3">Còn thiếu</th>
                    <th className="py-2 pr-3">Tổng thanh toán</th>
                    <th className="py-2 pr-3">Phương thức thanh toán</th>
                    <th className="py-2 pr-3">Trạng thái</th>
                    <th className="py-2 pr-3">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-6 text-center text-slate-400"
                      >
                        Đang tải…
                      </td>
                    </tr>
                  ) : invoiceRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-6 text-center text-slate-400"
                      >
                        Không có hoá đơn
                      </td>
                    </tr>
                  ) : (
                    invoiceRows.map((row, idx) => {
                      const payMethod = normalizeMethod(
                        row.lastPaymentMethod ?? null
                      );
                      return (
                        <tr
                          key={row.invoiceId}
                          className="text-center border-b last:border-none"
                        >
                          <td className="py-2 pr-3">{idx + 1}</td>

                          {/* Mã hồ sơ / invoiceCode */}
                          <td className="py-2 pr-3">{row.invoiceCode}</td>

                          {/* Bệnh nhân */}
                          <td className="py-2 pr-3 font-semibold">
                            {row.patientName}
                          </td>

                          {/* Ngày */}
                          <td className="py-2 pr-3">{row.visitDate}</td>

                          {/* Đã thu */}
                          <td className="py-2 pr-3 font-semibold text-green-500">
                            {row.paidAmount.toLocaleString("vi-VN")} ₫
                          </td>

                          {/* Còn thiếu */}
                          <td className="py-2 pr-3 font-semibold text-orange-500">
                            {row.remainingAmount.toLocaleString("vi-VN")} ₫
                          </td>

                          {/* Tổng thanh toán */}
                          <td className="py-2 pr-3 font-bold text-red-500">
                            {row.totalAmount.toLocaleString("vi-VN")} ₫
                          </td>

                          {/* Phương thức thanh toán */}
                          <td className="py-2 pr-3">
                            {payMethod ? (
                              <MethodBadge m={payMethod} />
                            ) : (
                              <span>-</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-2 pr-3">
                            <InvoiceStatusBadge status={row.statusLabel} />
                          </td>

                          {/* Thao tác */}
                          <td className="py-2 pr-3">
                            <Link
                              to={`/cms/billing/details/${row.invoiceId}`}
                              className="bg-primary-linear text-white px-3 py-1.5 rounded-[var(--rounded)] cursor-pointer"
                            >
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Bảng danh sách chờ thanh toán */}
            <div className="overflow-x-auto rounded-sm border border-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-sky-400 text-center text-white">
                    <th className="py-2 pr-3">STT</th>
                    <th className="py-2 pr-3">Mã hồ sơ</th>
                    <th className="py-2 pr-3">Bệnh nhân</th>
                    <th className="py-2 pr-3">Bác sĩ</th>
                    <th className="py-2 pr-3">Dịch vụ</th>
                    <th className="py-2 pr-3">Hoàn tất</th>
                    <th className="py-2 pr-3">Tổng thanh toán</th>
                    <th className="py-2 pr-3">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-slate-500"
                      >
                        Đang tải…
                      </td>
                    </tr>
                  ) : pending.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-slate-500"
                      >
                        Chưa có hồ sơ nào chờ thanh toán
                      </td>
                    </tr>
                  ) : (
                    pending.map((row, idx) => (
                      <tr
                        key={row.invoiceId ?? idx}
                        className="text-center border-b last:border-none"
                      >
                        {/* STT */}
                        <td className="py-2 pr-3">{idx + 1}</td>

                        {/* Mã hồ sơ / caseCode */}
                        <td className="py-2 pr-3 font-semibold">
                          {row.caseCode}
                        </td>

                        {/* Bệnh nhân */}
                        <td className="py-2 pr-3 font-bold">
                          {row.patientName}
                        </td>

                        {/* Bác sĩ */}
                        <td className="py-2 pr-3">{row.doctorName}</td>

                        {/* Dịch vụ chính */}
                        <td className="py-2 pr-3">{row.serviceName}</td>

                        {/* Hoàn tất lúc */}
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {row.finishedTime}
                          <span className="text-slate-300"> · </span>
                          {row.finishedDate}
                        </td>

                        {/* Tổng thanh toán */}
                        <td className="py-2 pr-3 font-semibold text-red-500">
                          {row.totalAmount.toLocaleString("vi-VN")} ₫
                        </td>

                        {/* Thao tác */}
                        <td className="py-2 pr-3">
                          <button
                            onClick={() =>
                              nav(`/cms/billing/payment/${row.invoiceId}`, {
                                state: {
                                  invoiceId: row.invoiceId,
                                  invoiceCode: row.invoiceCode,
                                  caseCode: row.caseCode, 
                                  patientName: row.patientName,
                                  finishedTime: row.finishedTime,
                                  finishedDate: row.finishedDate,
                                  totalAmount: row.totalAmount,
                                  doctorName: row.doctorName,
                                  serviceName: row.serviceName,
                                },
                              })
                            }
                            className="h-9 px-3 inline-flex items-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white cursor-pointer"
                            title="Thanh toán"
                          >
                            <Wallet className="w-4 h-4" /> Thanh toán
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
