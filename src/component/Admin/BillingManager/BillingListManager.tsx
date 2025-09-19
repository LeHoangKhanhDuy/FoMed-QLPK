import { useEffect, useState } from "react";
import { Plus, Search, Funnel, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  apiInvoiceList,
  apiCompletedVisitsPendingBilling,
} from "../../../types/billing/mockApi";
import {
  calcDue,
  calcPaid,
  calcSubTotal,
  type CompletedVisit,
  type Invoice,
  type Payment,
  type PaymentMethod,
} from "../../../types/billing/billing";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";

const toDMY = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

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

const STATUS_BADGE: Record<Exclude<StatusFilter, "all">, { cls: string }> = {
  Nháp: { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" },
  "Đã thanh toán": { cls: "bg-green-50 text-green-600 ring-1 ring-green-200" },
  "Chưa thanh toán": {
    cls: "bg-red-50 text-red-600 ring-1 ring-red-200",
  },
  "Hoàn tiền": { cls: "bg-amber-50 text-amber-600 ring-1 ring-amber-200" },
  Hủy: { cls: "bg-red-50 text-red-600 ring-1 ring-red-200" },
};

function InvoiceStatusBadge({
  status,
}: {
  status: Exclude<StatusFilter, "all">;
}) {
  const ui = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-[var(--rounded)] text-xs font-medium ${ui.cls}`}
    >
      {status}
    </span>
  );
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

const uniquePaymentMethods = (payments: Payment[]): PaymentMethod[] => {
  const set = new Set<PaymentMethod>();
  payments.forEach((p) => set.add(p.method));
  return [...set];
};

export default function BillingListManager() {
  const [tab, setTab] = useState<"invoices" | "pending">("pending");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const cx = (...a: Array<string | false | undefined>) =>
    a.filter(Boolean).join(" ");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pending, setPending] = useState<CompletedVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await apiInvoiceList({ q, status });
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await apiCompletedVisitsPendingBilling();
      setPending(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "invoices") {
      loadInvoices();
    } else {
      loadPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, status]); // lọc theo tab/trạng thái; search dùng nút "Lọc"

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2">
        <Wallet className="w-6 h-6 text-sky-500" />
        <h1 className="text-xl font-bold">Quản lý thanh toán</h1>
      </header>
      <div className="rounded-xl border bg-white p-4 shadow-xs space-y-3">
        {/* Tabs */}
        <div className="flex flex-col-2 gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`w-full sm:w-auto h-10 px-3 font-semibold rounded-[var(--rounded)] border cursor-pointer ${
              tab === "pending" ? "bg-sky-50 border-sky-400 text-sky-500" : ""
            }`}
          >
            Chờ thanh toán
          </button>
          <button
            onClick={() => setTab("invoices")}
            className={`w-full sm:w-auto h-10 px-3 font-semibold rounded-[var(--rounded)] border cursor-pointer ${
              tab === "invoices" ? "bg-sky-50 border-sky-400 text-sky-500" : ""
            }`}
          >
            Danh sách hoá đơn
          </button>
        </div>

        {tab === "invoices" ? (
          <>
            {/* Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              {/* Trái: search + select + (nút Lọc cho desktop) */}
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

                {/* Nút Lọc chỉ hiện ở ≥sm để giữ desktop như cũ */}
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

              {/* Phải: nút Tạo hoá đơn chỉ hiện ở ≥sm để giữ desktop như hình */}
              <button
                onClick={() => nav("/cms/billing/new")}
                className="hidden sm:inline-flex cursor-pointer h-12 px-4 items-center justify-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white whitespace-nowrap shrink-0"
              >
                + Tạo hoá đơn
              </button>

              {/* 👉 Mobile-only: gom Lọc + Tạo hoá đơn vào 1 hàng 2 cột */}
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

            {/* Table invoices */}
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
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-6 text-center text-slate-400"
                      >
                        Không có hoá đơn
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, idx) => (
                      <tr
                        key={inv.id}
                        className="text-center border-b last:border-none"
                      >
                        <td className="py-2 pr-3">{idx + 1}</td>
                        <td className="py-2 pr-3">{inv.code}</td>
                        <td className="py-2 pr-3 font-semibold">
                          {inv.patientName}
                        </td>
                        <td className="py-2 pr-3">{toDMY(inv.createdAt)}</td>
                        <td className="py-2 pr-3 font-semibold text-green-500">
                          {calcPaid(inv.payments).toLocaleString()} ₫
                        </td>
                        <td className="py-2 pr-3 font-semibold text-orange-500">
                          {calcDue(inv).toLocaleString()} ₫
                        </td>
                        <td className="py-2 pr-3 font-bold text-red-500">
                          {calcSubTotal(inv.items).toLocaleString()} ₫
                        </td>
                        <td className="py-2 pr-3">
                          {inv.payments.length === 0 ? (
                            <span>-</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {uniquePaymentMethods(inv.payments).map((m) => (
                                <MethodBadge key={m} m={m} />
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <InvoiceStatusBadge
                            status={inv.status as Exclude<StatusFilter, "all">}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <Link
                            to="/cms/billing/details"
                            className="bg-primary-linear text-white px-3 py-1.5 rounded-[var(--rounded)]"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Table pending patients – styled like your UI + dịch vụ & tổng */}
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
                    pending.map((v, idx) => {
                      // Lấy tên dịch vụ (dịch vụ đầu tiên + số lượng còn lại)
                      const svcCount = v.services?.length ?? 0;
                      const svcFirst = v.services?.[0]?.name ?? "-";
                      const svcLabel =
                        svcCount > 1
                          ? `${svcFirst} (+${svcCount - 1})`
                          : svcFirst;

                      // Tính tổng = phí khám + tổng dịch vụ + tổng thuốc
                      const total =
                        (v.examFee ?? 0) +
                        (v.services?.reduce((s, x) => s + (x.price ?? 0), 0) ??
                          0) +
                        (v.drugs?.reduce(
                          (s, x) => s + x.qty * x.unitPrice,
                          0
                        ) ?? 0);

                      return (
                        <tr
                          key={v.appointmentId}
                          className="text-center border-b last:border-none"
                        >
                          <td className="py-2 pr-3">{idx + 1}</td>
                          <td className="py-2 pr-3">#{v.appointmentId}</td>
                          <td className="py-2 pr-3 font-bold">
                            {v.patientName}
                          </td>
                          <td className="py-2 pr-3">{v.doctorName}</td>
                          <td className="py-2 pr-3">{svcLabel}</td>
                          <td className="py-2 pr-3">
                            {new Date(v.finishedAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                            <span className="text-slate-200"> · </span>
                            {toDMY(v.finishedAt)}
                          </td>
                          <td className="py-2 pr-3 font-semibold text-red-500">
                            {total.toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="py-2 pr-3">
                            <button
                              onClick={() => nav("/cms/billing/payment")}
                              className="h-9 px-3 inline-flex items-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white cursor-pointer"
                              title="Tạo hoá đơn"
                            >
                              <Wallet className="w-4 h-4" /> Thanh toán
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
