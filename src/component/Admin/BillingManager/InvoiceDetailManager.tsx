import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Wallet as WalletIcon,
  User2,
  CalendarDays,
  BadgeCheck,
  FilePenLine,
  Clock,
  XCircle,
  RotateCcw,
  CircleAlert,
  Circle,
  QrCode,
  Eraser,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  apiInvoiceAddPayment,
  apiInvoiceGet,
  apiInvoiceUpdateStatus,
  apiInvoiceList,
} from "../../../types/billing/mockApi";
import {
  calcDue,
  calcPaid,
  calcSubTotal,
  type Invoice,
  type PaymentMethod,
} from "../../../types/billing/billing";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";
import { QRCodeCanvas } from "qrcode.react";

/* ===== Helpers ===== */
const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Tiền mặt",
  card: "Thẻ",
  transfer: "Chuyển khoản",
  wallet: "Ví điện tử",
};

const METHOD_OPTIONS: SelectOption<PaymentMethod>[] = [
  { value: "cash", label: METHOD_LABEL.cash },
  { value: "card", label: METHOD_LABEL.card },
  { value: "transfer", label: METHOD_LABEL.transfer },
  { value: "wallet", label: METHOD_LABEL.wallet },
];

// Bấm được nhiều lần: cộng dồn
const QUICK_AMOUNTS = [
  1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000,
];

const formatVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const formatNumberVI = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
const parseNumberVI = (s: string) => {
  const digits = s.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? Number(digits) : 0;
};

const STATUS_ICON: Record<string, JSX.Element> = {
  "Đã thanh toán": <BadgeCheck className="h-4 w-4" aria-hidden />,
  Nháp: <FilePenLine className="h-4 w-4" aria-hidden />,
  "Chưa thanh toán": <Clock className="h-4 w-4" aria-hidden />,
  Hủy: <XCircle className="h-4 w-4" aria-hidden />,
  "Hoàn tiền": <RotateCcw className="h-4 w-4" aria-hidden />,
  Lỗi: <CircleAlert className="h-4 w-4" aria-hidden />,
};

const STATUS_STYLE: Record<string, string> = {
  "Đã thanh toán": "bg-green-50 text-green-600 border-green-200",
  Nháp: "bg-amber-50 text-amber-600 border-amber-200",
  "Chưa thanh toán": "bg-red-50 text-red-600 border-red-200",
  Hủy: "bg-gray-50 text-gray-600 border-gray-200",
  "Hoàn tiền": "bg-indigo-50 text-indigo-600 border-indigo-200",
};

export function StatusBadge({ status }: { status: string }) {
  const icon = STATUS_ICON[status] ?? (
    <Circle className="h-3 w-3" aria-hidden />
  );
  const style =
    STATUS_STYLE[status] ?? "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs ${style}`}
    >
      {icon}
      {status}
    </span>
  );
}

/* ===== Tiny Toast ===== */
type ToastTone = "success" | "info" | "error";
function Toast({
  open,
  msg,
  tone,
  onClose,
}: {
  open: boolean;
  msg: string;
  tone: ToastTone;
  onClose: () => void;
}) {
  if (!open) return null;
  const toneCls =
    tone === "success"
      ? "border-emerald-200 text-emerald-700"
      : tone === "error"
      ? "border-rose-200 text-rose-700"
      : "border-sky-200 text-sky-700";
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : Info;
  return (
    <div
      className={`fixed bottom-4 right-4 z-[60] rounded-lg border bg-white px-3 py-2 shadow-md ${toneCls}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{msg}</span>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-slate-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ===== Component ===== */
export default function InvoiceDetailManager() {
  const { invoiceId } = useParams();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // payDisplay: chuỗi hiển thị (12.000), payAmount: số (12000)
  const [payDisplay, setPayDisplay] = useState<string>("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("cash");

  // toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastTone, setToastTone] = useState<ToastTone>("success");
  const showToast = (msg: string, tone: ToastTone = "success") => {
    setToastMsg(msg);
    setToastTone(tone);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 2200);
  };

  // QR
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");

  const nav = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const idNum = Number(invoiceId);
      let idToLoad: number | null = null;

      if (invoiceId && !Number.isNaN(idNum)) {
        idToLoad = idNum;
      } else {
        const list = await apiInvoiceList();
        if (list.length > 0) idToLoad = list[0].id;
      }

      if (idToLoad == null) {
        setInv(null);
        return;
      }

      const data = await apiInvoiceGet(idToLoad);
      setInv(data);

      setPayAmount(0);
      setPayDisplay("");
      setShowQR(false);
      setQrValue("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  /* ===== Currency handlers ===== */
  const setPayByNumber = (n: number) => {
    const v = Math.max(0, n);
    setPayAmount(v);
    setPayDisplay(v === 0 ? "" : formatNumberVI(v));
  };

  const handlePayInput = (raw: string) => {
    const n = parseNumberVI(raw);
    setPayByNumber(n);
  };

  const handlePayBlur = () => {
    setPayDisplay(payAmount === 0 ? "" : formatNumberVI(payAmount));
  };

  // Cộng dồn bằng functional update => bấm nhanh không bị trễ state
  const addQuick = (n: number) => {
    setPayAmount((prev) => {
      const next = Math.max(0, prev + n);
      setPayDisplay(next === 0 ? "" : formatNumberVI(next));
      return next;
    });
  };

  const appendDigits = (d: string) => {
    setPayAmount((prev) => {
      const currentDigits = (prev === 0 ? "" : String(prev)).replace(/\D/g, "");
      const nextDigits = (currentDigits + d).replace(/^0+/, "");
      const next = nextDigits ? Number(nextDigits) : 0;
      setPayDisplay(next === 0 ? "" : formatNumberVI(next));
      return next;
    });
  };

  const backspace = () => {
    setPayAmount((prev) => {
      const currentDigits = String(prev).replace(/\D/g, "");
      const nextDigits = currentDigits.slice(0, -1);
      const next = nextDigits ? Number(nextDigits) : 0;
      setPayDisplay(next === 0 ? "" : formatNumberVI(next));
      return next;
    });
  };

  const clearAll = () => setPayByNumber(0);

  /* ===== Actions ===== */
  const addPayment = async () => {
    if (!inv) return;
    const due = calcDue(inv);
    if (payAmount <= 0) return;

    const pay = Math.min(payAmount, due);
    await apiInvoiceAddPayment(inv.id, method, pay);

    const newPayment: (typeof inv.payments)[number] = {
      id: 0,
      invoiceId: inv.id,
      method,
      paidAmount: pay,
      paidAt: "",
    };

    const afterPaid = calcPaid([...inv.payments, newPayment]);
    const subtotal = calcSubTotal(inv.items);
    if (afterPaid >= subtotal && inv.status !== "Đã thanh toán") {
      await apiInvoiceUpdateStatus(inv.id, "Đã thanh toán");
    }

    showToast("Thu tiền thành công", "success");
    await load();
  };

  const createPaymentCode = () => {
    if (!inv) return;
    const due = calcDue(inv);
    // bạn có thể thay bằng payload theo cổng thanh toán thực tế
    const payload = `INV:${inv.code}|AMT:${due}|METHOD:${method}`;
    setQrValue(payload);
    setShowQR(true);
    showToast("Đã tạo mã thanh toán", "info");
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-xs">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="h-4 w-3/5 rounded bg-slate-200" />
          <div className="h-4 w-2/5 rounded bg-slate-200" />
          <div className="h-48 w-full rounded bg-slate-100" />
        </div>
      </div>
    );
  }
  if (!inv) return <p className="text-slate-500">Chưa có dữ liệu hoá đơn.</p>;

  const subtotal = calcSubTotal(inv.items);
  const paid = calcPaid(inv.payments);
  const due = calcDue(inv);
  const isCash = method === "cash";
  const canCollect = due > 0;
  const change = isCash ? Math.max(0, payAmount - due) : 0;

  return (
    <section className="space-y-4">
      {/* Toast */}
      <Toast
        open={toastOpen}
        msg={toastMsg}
        tone={toastTone}
        onClose={() => setToastOpen(false)}
      />

      {/* Header */}
      <header className="flex items-center justify-between rounded-xl border bg-white/80 px-3 py-2 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold">
            Hoá đơn <span className="text-slate-500">#{inv.code}</span>
          </h1>
        </div>
        <button
          className="h-10 px-3 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 cursor-pointer"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" /> In hoá đơn
        </button>
      </header>

      {/* Card */}
      <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-xs space-y-5">
        {/* Info */}
        <div className="grid sm:grid-cols-3 gap-3 text-[15px]">
          <div className="rounded-lg border bg-slate-50/60 px-3 py-2">
            <div className="flex items-center gap-2 text-slate-600">
              <User2 className="h-5 w-5" />
              <span className="text-lg">Bệnh nhân</span>
            </div>
            <b className="mt-1 block">{inv.patientName}</b>
          </div>
          <div className="rounded-lg border bg-slate-50/60 px-3 py-2">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Clock className="h-5 w-5" />
              <div className="text-lg text-slate-600">Trạng thái</div>
            </div>
            <StatusBadge status={inv.status} />
          </div>
          <div className="rounded-lg border bg-slate-50/60 px-3 py-2">
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarDays className="h-5 w-5" />
              <span className="text-lg">Ngày tạo</span>
            </div>
            <div className="mt-1">
              {new Date(inv.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-auto rounded-lg border">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-sky-400 text-white">
              <tr>
                <th className="px-3 py-2 text-left">STT</th>
                <th className="px-3 py-2 text-left">Tên dịch vụ</th>
                <th className="px-3 py-2 text-left">Loại dịch vụ</th>
                <th className="px-3 py-2 text-left">Số lượng</th>
                <th className="px-3 py-2 text-left">Đơn giá</th>
                <th className="px-3 py-2 text-left">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-3 py-2">{it.id}</td>
                  <td className="px-3 py-2">{it.name}</td>
                  <td className="px-3 py-2 capitalize">{it.type}</td>
                  <td className="px-3 py-2">{it.qty}</td>
                  <td className="px-3 py-2 font-semibold">
                    {formatVND(it.unitPrice)}
                  </td>
                  <td className="px-3 py-2 font-bold text-red-500">
                    {formatVND(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Pay */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Totals */}
          <div className="grid grid-cols-3 gap-3 sm:max-w-[600px] w-full mt-1">
            <div className="rounded-xl border px-4 py-3">
              <div className="text-slate-500 text-xs">Tổng tiền</div>
              <div className="text-red-500 text-base sm:text-lg font-semibold">
                {formatVND(subtotal)}
              </div>
            </div>
            <div className="rounded-xl border px-4 py-3">
              <div className="text-slate-500 text-xs">Đã thu</div>
              <div className="text-green-600 text-base sm:text-lg font-semibold">
                {formatVND(paid)}
              </div>
            </div>
            <div className="rounded-xl border px-4 py-3 bg-rose-50/60">
              <div className="text-slate-500 text-xs">Còn thiếu</div>
              <div className="text-orange-500 text-base sm:text-lg font-semibold ">
                {formatVND(due)}
              </div>
            </div>
          </div>

          {/* Pay Zone */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Left column: select + inputs + button */}
            <div className="flex flex-col gap-2 w-full sm:w-50">
              <SelectMenu<PaymentMethod>
                value={method}
                options={METHOD_OPTIONS}
                onChange={(v) => {
                  if (!v) return;
                  setMethod(v);
                  if (v !== "cash") {
                    // chuyển sang non-cash: ẩn QR cho đến khi bấm tạo
                    setShowQR(false);
                  }
                }}
                className="w-full"
              />

              {isCash && (
                <>
                  {/* Input tiền Việt */}
                  <label className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Số tiền khách trả"
                      value={payDisplay}
                      onChange={(e) => handlePayInput(e.target.value)}
                      onBlur={handlePayBlur}
                      className="mt-1 text-right rounded-[var(--rounded)] border px-4 py-3 text-[16px] w-full pr-8"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ₫
                    </span>
                  </label>

                  {/* Ô thối lại có khung */}
                  <div className="mt-1 w-full rounded-[var(--rounded)] border px-4 py-3 text-[16px] flex items-center justify-between bg-slate-50">
                    <span className="text-slate-500">Tiền thối</span>
                    <b className="text-green-500">{formatVND(change)}</b>
                  </div>
                </>
              )}

              <button
                onClick={isCash ? addPayment : createPaymentCode}
                disabled={!canCollect || (isCash && payAmount <= 0)}
                className="mt-1 px-4 py-3 text-[16px] inline-flex items-center justify-center gap-2 rounded-[var(--rounded)] bg-primary-linear text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                title={
                  canCollect
                    ? isCash
                      ? "Thu tiền"
                      : "Tạo QR thanh toán"
                    : "Không còn số tiền phải thu"
                }
              >
                {isCash ? (
                  <>
                    <WalletIcon className="w-5 h-5" />
                    Thu tiền
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Tạo QR thanh toán
                  </>
                )}
              </button>
            </div>

            {/* Right panel:
                - Cash  -> keypad + mệnh giá
                - Non-cash + showQR -> hiển thị QR */}
            {(isCash || showQR) && (
              <div className="flex-1 rounded-xl border p-3 mt-1">
                {isCash ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* LEFT: Mệnh giá nhanh (cộng dồn) */}
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        Mệnh giá nhanh
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {QUICK_AMOUNTS.map((v) => (
                          <button
                            key={v}
                            onClick={() => addQuick(v)}
                            className="h-10 w-full cursor-pointer rounded-[var(--rounded)] border text-sm font-medium text-center whitespace-nowrap truncate hover:bg-sky-400 hover:text-white"
                            title={`+ ${formatVND(v)}`}
                          >
                            {formatVND(v)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: Bàn phím số */}
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        Bàn phím số
                      </div>
                      <div className="grid grid-cols-3 gap-2 w-full max-w-sm md:max-w-none">
                        {[
                          "1",
                          "2",
                          "3",
                          "4",
                          "5",
                          "6",
                          "7",
                          "8",
                          "9",
                          "000",
                          "0",
                          "⌫",
                        ].map((k) => (
                          <button
                            key={k}
                            onClick={() => {
                              if (k === "⌫") backspace();
                              else if (k === "000") appendDigits("000");
                              else appendDigits(k);
                            }}
                            className="cursor-pointer rounded-[var(--rounded)] border px-4 py-3 text-base hover:bg-sky-400 hover:text-white"
                          >
                            {k}
                          </button>
                        ))}
                        <button
                          onClick={clearAll}
                          className="col-span-3 cursor-pointer rounded-[var(--rounded)] border px-4 py-3 text-base hover:bg-red-400 hover:text-white inline-flex items-center justify-center gap-2"
                          title="Xoá hết"
                        >
                          <Eraser className="w-5 h-5" />
                          Xoá hết
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* NON-CASH: QR hiển thị bên phải sau khi bấm "Tạo QR thanh toán" */
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-md font-bold mb-3">
                      Mã QR thanh toán cho hóa đơn #{inv.code}
                    </div>
                    <div className="rounded-xl border p-4 bg-white">
                      <QRCodeCanvas value={qrValue || "EMPTY"} size={192} />
                    </div>
                    <div className="mt-2 text-sm">
                      Khách hàng quét QR để thanh toán
                    </div>
                    <p className="text-red-500 font-bold">{formatVND(due)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
