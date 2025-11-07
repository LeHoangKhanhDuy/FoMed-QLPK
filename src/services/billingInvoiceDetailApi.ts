import { authHttp } from "./http";

/* ================== Types (FE) ================== */
export type InvoiceStatus =
  | "draft"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "void"
  | "refunded"
  | "canceled";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank"
  | "momo"
  | "vnpay"
  | "zalopay"
  | "qr"
  | "other";

export interface InvoiceCustomer {
  id?: number;
  code?: string;
  fullName?: string;
  phone?: string;
}

export interface InvoiceLine {
  id: number;
  serviceId?: number | null;
  serviceCode?: string | null;
  serviceName: string;
  qty: number;
  unitPrice: number; // đơn giá chưa VAT
  discount?: number; // số tiền giảm trên line
  amount: number; // thành tiền của line (sau giảm)
  note?: string | null;
}

export interface InvoicePayment {
  id: number;
  paidAt: string; // ISO
  method: PaymentMethod;
  amount: number;
  note?: string | null;
  txRef?: string | null; // mã giao dịch (nếu có)
}

export interface InvoiceDetail {
  id: number;
  code: string;
  createdAt: string;
  dueAt?: string | null;
  status: InvoiceStatus;

  customer?: InvoiceCustomer;

  lines: InvoiceLine[];
  payments: InvoicePayment[];

  // tổng tiền
  subTotal: number; // tổng trước thuế/giảm
  discountTotal: number;
  taxTotal: number;
  grandTotal: number; // tổng thanh toán = subTotal - discountTotal + taxTotal

  paidTotal: number; // đã thanh toán
  balanceDue: number; // còn phải trả

  notes?: string | null;
}

/* ================== Types (BE – mềm dẻo) ================== */
type BEInvoiceLine = Partial<{
  id: number;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  amount: number;
  note: string;
}>;

type BEInvoicePayment = Partial<{
  id: number;
  paidAt: string;
  method: string;
  amount: number;
  note: string;
  txRef: string;
}>;

type BEInvoiceDetail = Partial<{
  id: number;
  code: string;
  createdAt: string;
  dueAt: string | null;
  status: string;

  customer: Partial<{
    id: number;
    code: string;
    fullName: string;
    phone: string;
  }>;

  lines: BEInvoiceLine[];
  payments: BEInvoicePayment[];

  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;

  paidTotal: number;
  balanceDue: number;

  notes: string | null;
}>;

/* ================== Helpers ================== */
function normalizeStatus(s?: string | null): InvoiceStatus {
  const x = (s ?? "").toLowerCase().trim();
  if (["paid"].includes(x)) return "paid";
  if (["partially_paid", "partial", "part-paid"].includes(x))
    return "partially_paid";
  if (["unpaid", "open"].includes(x)) return "unpaid";
  if (["void", "cancelled", "canceled"].includes(x)) return "void";
  if (["refunded"].includes(x)) return "refunded";
  if (["draft"].includes(x)) return "draft";
  return "unpaid";
}

function normalizeMethod(s?: string | null): PaymentMethod {
  const x = (s ?? "").toLowerCase().trim();
  if (["cash", "tiền mặt"].includes(x)) return "cash";
  if (["card", "credit", "debit"].includes(x)) return "card";
  if (["bank", "transfer"].includes(x)) return "bank";
  if (["momo"].includes(x)) return "momo";
  if (["vnpay"].includes(x)) return "vnpay";
  if (["zalo", "zalopay"].includes(x)) return "zalopay";
  if (["qr"].includes(x)) return "qr";
  return "other";
}

/* ================== API ================== */
// GET /api/v1/admin/billing/invoices/{invoiceId}
export async function apiAdminGetInvoiceDetail(
  invoiceId: number
): Promise<InvoiceDetail> {
  const { data } = await authHttp.get(
    `/api/v1/admin/billing/invoices/${invoiceId}`
  );

  // API chuẩn: { success, message, data: {...} }
  const d: BEInvoiceDetail = data?.data ?? {};

  const linesSrc: BEInvoiceLine[] = Array.isArray(d.lines) ? d.lines : [];
  const paymentsSrc: BEInvoicePayment[] = Array.isArray(d.payments)
    ? d.payments
    : [];

  const lines: InvoiceLine[] = linesSrc.map((l, i) => ({
    id: typeof l.id === "number" ? l.id : i + 1,
    serviceId: l.serviceId ?? null,
    serviceCode: l.serviceCode ?? null,
    serviceName: l.serviceName ?? "(Không rõ dịch vụ)",
    qty: typeof l.qty === "number" ? l.qty : 1,
    unitPrice: typeof l.unitPrice === "number" ? l.unitPrice : 0,
    discount: typeof l.discount === "number" ? l.discount : 0,
    amount:
      typeof l.amount === "number"
        ? l.amount
        : (typeof l.qty === "number" ? l.qty : 1) *
            (typeof l.unitPrice === "number" ? l.unitPrice : 0) -
          (typeof l.discount === "number" ? l.discount : 0),
    note: l.note ?? null,
  }));

  const payments: InvoicePayment[] = paymentsSrc.map((p, i) => ({
    id: typeof p.id === "number" ? p.id : i + 1,
    paidAt: p.paidAt ?? "",
    method: normalizeMethod(p.method),
    amount: typeof p.amount === "number" ? p.amount : 0,
    note: p.note ?? null,
    txRef: p.txRef ?? null,
  }));

  const subTotal =
    typeof d.subTotal === "number"
      ? d.subTotal
      : lines.reduce((s, x) => s + x.qty * x.unitPrice, 0);
  const discountTotal =
    typeof d.discountTotal === "number"
      ? d.discountTotal
      : lines.reduce((s, x) => s + (x.discount ?? 0), 0);
  const taxTotal = typeof d.taxTotal === "number" ? d.taxTotal : 0;
  const grandTotal =
    typeof d.grandTotal === "number"
      ? d.grandTotal
      : subTotal - discountTotal + taxTotal;
  const paidTotal =
    typeof d.paidTotal === "number"
      ? d.paidTotal
      : payments.reduce((s, x) => s + x.amount, 0);
  const balanceDue =
    typeof d.balanceDue === "number"
      ? d.balanceDue
      : Math.max(0, grandTotal - paidTotal);

  return {
    id: d.id ?? invoiceId,
    code: d.code ?? `INV-${invoiceId}`,
    createdAt: d.createdAt ?? "",
    dueAt: d.dueAt ?? null,
    status: normalizeStatus(d.status),

    customer: d.customer
      ? {
          id: d.customer.id,
          code: d.customer.code,
          fullName: d.customer.fullName,
          phone: d.customer.phone,
        }
      : undefined,

    lines,
    payments,

    subTotal,
    discountTotal,
    taxTotal,
    grandTotal,

    paidTotal,
    balanceDue,

    notes: d.notes ?? null,
  };
}
