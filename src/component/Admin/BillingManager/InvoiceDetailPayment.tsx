// InvoiceView.tsx
import { Printer, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiInvoiceGetDetail,
  type InvoiceDetailResponse,
} from "../../../services/billingApi";

/* ===== Helpers ===== */
const vnd = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";

const pillClassByStatus = (s: string) => {
  if (s === "Đã thanh toán")
    return "bg-green-50 text-green-500 border-green-200";
  if (s === "Thanh toán một phần" || s === "Chưa thanh toán")
    return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
};

const METHOD_LABEL: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ ngân hàng",
  transfer: "Chuyển khoản",
  wallet: "Ví điện tử",
  "e-wallet": "Ví điện tử",
};

/* ===== Component ===== */
export default function InvoiceDetailPayment() {
  const { invoiceId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<InvoiceDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const detail = await apiInvoiceGetDetail(Number(invoiceId));
        setData(detail);
      } catch (err) {
        console.error("Failed to load invoice detail:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId]);

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

  if (!data) {
    return <p className="text-slate-500">Không tìm thấy dữ liệu hoá đơn.</p>;
  }

  const {
    invoiceCode,
    createdAtText,
    statusLabel,
    items,
    patientInfo,
    doctorInfo,
    paymentInfo,
  } = data;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold">
            Hoá đơn <span className="text-slate-500">#{invoiceCode}</span>
          </h1>
        </div>
        <button
          className="h-10 px-3 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 cursor-pointer"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" /> In hoá đơn
        </button>
      </header>

      {/* Order meta */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="grid md:grid-cols-3 gap-4 p-3">
          <div className="flex items-center gap-2">
            <p className="text-sm">Mã hoá đơn: </p>
            <p className="font-semibold text-sky-400">#{invoiceCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm">Ngày tạo:</p>
            <p className="font-semibold">{createdAtText}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm">Trạng thái:</p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm border ${pillClassByStatus(
                statusLabel
              )}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết dịch vụ/thuốc */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm bg-white">
          <thead>
            <tr className="bg-sky-400 text-center text-white">
              <th className="py-2 pr-3">STT</th>
              <th className="py-2 pr-3">Tên dịch vụ</th>
              <th className="py-2 pr-3">Loại</th>
              <th className="py-2 pr-3">Số lượng</th>
              <th className="py-2 pr-3">Đơn giá</th>
              <th className="py-2 pr-3">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  Không có dịch vụ/thuốc
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr
                  key={it.lineNo}
                  className="text-center border-b last:border-none"
                >
                  <td className="py-2 pr-3">{idx + 1}</td>
                  <td className="py-2 pr-3 font-medium">{it.itemName}</td>
                  <td className="py-2 pr-3 capitalize">{it.itemType}</td>
                  <td className="py-2 pr-3">{it.quantity}</td>
                  <td className="py-2 pr-3">{vnd(it.unitPrice)}</td>
                  <td className="py-2 pr-3 text-red-500 font-bold">
                    {vnd(it.lineTotal)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3 cột info */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Thông tin bệnh nhân */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:col-span-1">
          <h3 className="font-semibold">Thông tin bệnh nhân</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Họ và tên" value={patientInfo.fullName} />
            <Row label="Mã hồ sơ" value={patientInfo.caseCode} />
            {patientInfo.dateOfBirth && (
              <Row label="Ngày sinh" value={patientInfo.dateOfBirth} />
            )}
            {patientInfo.gender && (
              <Row label="Giới tính" value={patientInfo.gender} />
            )}
            <Row label="Email" value={patientInfo.email || "-"} />
            <Row label="Số điện thoại" value={patientInfo.phone || "-"} />
            <Row label="Ghi chú" value={patientInfo.note || "-"} />
          </div>
        </div>

        {/* Thông tin bác sĩ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:col-span-1">
          <h3 className="font-semibold">Thông tin bác sĩ</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Họ và tên" value={doctorInfo.fullName} />
            <Row label="Chuyên khoa" value={doctorInfo.specialtyName || "-"} />
            <Row label="Cơ sở" value={doctorInfo.clinicName || "-"} />
            <Row label="Email" value={doctorInfo.email || "-"} />
            <Row label="Số điện thoại" value={doctorInfo.phone || "-"} />
          </div>
        </div>

        {/* Thông tin thanh toán */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:col-span-1">
          <h3 className="font-semibold">Thông tin thanh toán</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Tiền dịch vụ" value={vnd(paymentInfo.subtotal)} />
            <Row label="Giảm giá" value={vnd(paymentInfo.discount)} />
            <Row label="Thuế" value={vnd(paymentInfo.tax)} />
            <Row
              label={<span className="font-medium">Tổng thanh toán</span>}
              value={
                <span className="text-red-500 font-bold">
                  {vnd(paymentInfo.totalAmount)}
                </span>
              }
            />
            <Row
              label="Đã thanh toán"
              value={
                <span className="text-green-600 font-semibold">
                  {vnd(paymentInfo.paidAmount)}
                </span>
              }
            />
            <Row
              label="Còn thiếu"
              value={
                <span className="text-orange-500 font-semibold">
                  {vnd(paymentInfo.remainingAmount)}
                </span>
              }
            />
            <Row
              label="Phương thức"
              value={METHOD_LABEL[paymentInfo.method] || paymentInfo.method}
            />
            <Row label="Thời gian thanh toán" value={paymentInfo.paidAtText} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Small row component ===== */
function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-1 text-slate-500">{label}</div>
      <div className="col-span-2 font-medium">{value}</div>
    </div>
  );
}
