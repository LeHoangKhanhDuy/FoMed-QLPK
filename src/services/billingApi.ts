// src/services/billingApi.ts
import { authHttp } from "./http";
import type {
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
} from "../types/billing/billing";

export type BEInvoiceListRow = {
  invoiceId: number;
  invoiceCode: string;
  patientName: string;
  visitDate: string; // "dd/MM/yyyy" hoặc ISO -> FE chỉ show text
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;
  lastPaymentMethod: string | null;
  statusLabel: string; // "Đã thanh toán", ...
};

export type BEPendingRow = {
  invoiceId: number;
  invoiceCode: string;
  caseCode: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  finishedTime: string; // "10:10"
  finishedDate: string; // "31/10/2025"
  totalAmount: number;
};
/* ================ DANH SÁCH CHỜ THANH TOÁN ================= */
export async function apiCompletedVisitsPendingBilling(): Promise<
  BEPendingRow[]
> {
  const { data } = await authHttp.get<{
    success: boolean;
    data: Array<{
      invoiceId: number;
      invoiceCode: string;
      caseCode: string;
      patientName: string;
      doctorName: string;
      serviceName: string;
      finishedTime: string;
      finishedDate: string;
      totalAmount: number;
    }>;
  }>("/api/v1/admin/billing/pending");

  return (Array.isArray(data.data) ? data.data : []).map((row) => ({
    invoiceId: row.invoiceId,
    invoiceCode: row.invoiceCode,
    caseCode: row.caseCode,
    patientName: row.patientName,
    doctorName: row.doctorName,
    serviceName: row.serviceName,
    finishedTime: row.finishedTime,
    finishedDate: row.finishedDate,
    totalAmount: row.totalAmount,
  }));
}

/* ========================================
   2) Danh sách hoá đơn
   GET /api/v1/admin/billing/invoices
   NOTE: ở FE mình đang hiển thị:
    - id
    - code
    - patientName
    - createdAt
    - status
    - payments[] (method, paidAmount)
    - items[] (qty, unitPrice, amount)
   ======================================== */
export async function apiInvoiceList(params?: {
  q?: string;
  status?: InvoiceStatus | "all";
  dateFrom?: string;
  dateTo?: string;
}): Promise<BEInvoiceListRow[]> {
  const { data } = await authHttp.get<unknown>(
    "/api/v1/admin/billing/invoices",
    {
      params: {
        q: params?.q,
        status: params?.status === "all" ? undefined : params?.status,
        from: params?.dateFrom,
        to: params?.dateTo,
      },
    }
  );

  const outer = data as { data?: unknown[] | { items?: unknown[] } };

  let rows: unknown[] = [];

  if (Array.isArray(outer?.data)) {
    rows = outer.data;
  } else if (Array.isArray(outer?.data?.items)) {
    rows = outer.data.items;
  } else {
    rows = [];
  }

  return rows.map((row) => {
    const rowData = row as {
      invoiceId?: number;
      invoiceCode?: string;
      patientName?: string;
      visitDate?: string;
      paidAmount?: number;
      remainingAmount?: number;
      totalAmount?: number;
      lastPaymentMethod?: string | null;
      statusLabel?: string;
    };
    return {
      invoiceId: rowData.invoiceId ?? 0,
      invoiceCode: rowData.invoiceCode ?? "",
      patientName: rowData.patientName ?? "",
      visitDate: rowData.visitDate ?? "",
      paidAmount: rowData.paidAmount ?? 0,
      remainingAmount: rowData.remainingAmount ?? 0,
      totalAmount: rowData.totalAmount ?? 0,
      lastPaymentMethod: rowData.lastPaymentMethod ?? null,
      statusLabel: rowData.statusLabel ?? "",
    };
  });
}

/* helper để map tên method BE -> union PaymentMethod FE */
function normalizePaymentMethod(m: string): PaymentMethod {
  const v = m.toLowerCase();
  if (v.includes("cash") || v.includes("tiền")) return "cash";
  if (v.includes("card") || v.includes("thẻ")) return "card";
  if (v.includes("transfer") || v.includes("khoản")) return "transfer";
  // ví điện tử, momo,...
  return "wallet";
}

/* ================== CHI TIẾT HÓA ĐƠN ================= */
export async function apiInvoiceGet(id: number): Promise<Invoice> {
  const { data } = await authHttp.get<{
    success: boolean;
    data: {
      invoiceId: number;
      invoiceCode: string;
      patientId?: number;
      patientName: string;
      createdAt: string;
      statusLabel: string;

      items?: Array<{
        lineNo: number; 
        itemType: string;
        itemName: string; 
        quantity: number;
        unitPrice: number;
        lineTotal: number; 
      }>;

      payments?: Array<{
        paymentId: number;
        method: string;
        amount: number;
        paidAt: string;
        refNumber?: string | null;
      }>;

      note?: string;
    };
  }>(`/api/v1/admin/billing/invoices/${id}`);

  const raw = data.data;

  const mappedItems = (raw.items ?? []).map((it) => ({
    id: it.lineNo,
    type: (it.itemType as "exam" | "service" | "drug") ?? "service",
    refId: undefined,
    name: it.itemName, 
    qty: Number(it.quantity),
    unitPrice: it.unitPrice,
    amount: it.lineTotal, 
  }));

  const mappedPays: Payment[] = (raw.payments ?? []).map((p) => ({
    id: p.paymentId,
    invoiceId: raw.invoiceId,
    method: normalizePaymentMethod(p.method),
    paidAmount: p.amount,
    txnRef: p.refNumber ?? undefined,
    paidAt: p.paidAt,
  }));

  return {
    id: raw.invoiceId,
    code: raw.invoiceCode,
    patientId: raw.patientId ?? 0,
    patientName: raw.patientName,
    appointmentId: undefined,
    createdAt: raw.createdAt,
    status: raw.statusLabel as InvoiceStatus,
    items: mappedItems,
    payments: mappedPays,
    note: raw.note ?? "",
  };
}


/* ========================================
   4) Thanh toán hoá đơn
   POST /api/v1/admin/billing/pay
   body ví dụ:
   {
     "invoiceId": 7,
     "method": "cash",
     "amount": 130000,
     "refNumber": "MOMO-ABC123"
   }
   trả về payment record mới
   ======================================== */
export async function apiInvoiceAddPayment(
  invoiceId: number,
  method: PaymentMethod,
  amount: number,
  txnRef?: string
): Promise<Payment> {
  // map FE -> BE method
  const beMethod = method === "wallet" ? "e-wallet" : method;

  const { data } = await authHttp.post<{
    success: boolean;
    data: {
      paymentId: number;
      invoiceId: number;
      method: string;
      amount: number;
      paidAt: string;
      refNumber?: string | null;
    };
  }>("/api/v1/admin/billing/pay", {
    invoiceId,
    method: beMethod,
    amount,
    refNumber: txnRef,
  });

  const p = data.data;

  const mapped: Payment = {
    id: p.paymentId,
    invoiceId: p.invoiceId,
    method: beMethod === "e-wallet" ? "wallet" : (beMethod as PaymentMethod),
    paidAmount: p.amount,
    paidAt: p.paidAt,
    txnRef: p.refNumber ?? undefined,
  };

  return mapped;
}

export async function apiInvoiceUpdateStatus(
  invoiceId: number,
  status: InvoiceStatus
): Promise<void> {
  // Ví dụ PATCH:
  await authHttp.patch("/api/v1/admin/billing/invoices/" + invoiceId, {
    status: status,
  });
}
