import { addDays } from "../schedule/date";
import type { CompletedVisit, Invoice, InvoiceStatus, Payment, PaymentMethod } from "./billing";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
let AUTO_INV_ID = 1,
  AUTO_ITEM_ID = 1,
  AUTO_PAY_ID = 1;

const todayISO = (d: Date = new Date()) => d.toISOString();

const MOCK_COMPLETED_VISITS: CompletedVisit[] = [
  {
    appointmentId: 5003,
    patientId: 201,
    patientName: "Phạm Đức C",
    doctorName: "BS. Nguyễn Minh An",
    finishedAt: new Date().toISOString(),
    examFee: 120000,
    services: [{ name: "X-quang phổi", price: 180000 }],
    drugs: [{ name: "Amoxicillin 500mg", qty: 1, unitPrice: 45000 }],
  },
  {
    appointmentId: 5004,
    patientId: 202,
    patientName: "Đỗ Thị D",
    doctorName: "BS. Trần Thảo Vy",
    finishedAt: new Date().toISOString(),
    examFee: 100000,
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: AUTO_INV_ID++,
    code: "INV-0001",
    patientId: 101,
    patientName: "Nguyễn Văn A",
    appointmentId: 5001,
    createdAt: todayISO(addDays(new Date(), -1)),
    status: "Đã thanh toán",
    items: [
      {
        id: AUTO_ITEM_ID++,
        type: "exam",
        name: "Phí khám",
        qty: 1,
        unitPrice: 120000,
        amount: 120000,
      },
      {
        id: AUTO_ITEM_ID++,
        type: "service",
        name: "Siêu âm tim",
        qty: 1,
        unitPrice: 350000,
        amount: 350000,
      },
    ],
    payments: [
      {
        id: AUTO_PAY_ID++,
        invoiceId: 1,
        method: "cash",
        paidAmount: 470000,
        paidAt: todayISO(),
      },
    ],
    note: "",
  },
  {
    id: AUTO_INV_ID++,
    code: "INV-0002",
    patientId: 105,
    patientName: "Nguyễn Văn D",
    appointmentId: 5001,
    createdAt: todayISO(addDays(new Date(), -1)),
    status: "Đã thanh toán",
    items: [
      {
        id: AUTO_ITEM_ID++,
        type: "exam",
        name: "Phí khám",
        qty: 1,
        unitPrice: 120000,
        amount: 120000,
      },
      {
        id: AUTO_ITEM_ID++,
        type: "service",
        name: "Siêu âm tim",
        qty: 1,
        unitPrice: 350000,
        amount: 350000,
      },
    ],
    payments: [
      {
        id: AUTO_PAY_ID++,
        invoiceId: 1,
        method: "card",
        paidAmount: 470000,
        paidAt: todayISO(),
      },
    ],
    note: "",
  },
  {
    id: AUTO_INV_ID++,
    code: "INV-0003",
    patientId: 102,
    patientName: "Trần Thị B",
    appointmentId: 5002,
    createdAt: todayISO(),
    status: "Chưa thanh toán",
    items: [
      {
        id: AUTO_ITEM_ID++,
        type: "exam",
        name: "Phí khám",
        qty: 1,
        unitPrice: 100000,
        amount: 100000,
      },
      {
        id: AUTO_ITEM_ID++,
        type: "drug",
        name: "Paracetamol 500mg",
        qty: 2,
        unitPrice: 15000,
        amount: 30000,
      },
    ],
    payments: [],
    note: "",
  },
  {
    id: AUTO_INV_ID++,
    code: "INV-0004",
    patientId: 111,
    patientName: "Trần Thị M",
    appointmentId: 5002,
    createdAt: todayISO(),
    status: "Đã thanh toán",
    items: [
      {
        id: AUTO_ITEM_ID++,
        type: "exam",
        name: "Phí khám",
        qty: 1,
        unitPrice: 100000,
        amount: 100000,
      },
      {
        id: AUTO_ITEM_ID++,
        type: "drug",
        name: "Paracetamol 500mg",
        qty: 2,
        unitPrice: 15000,
        amount: 30000,
      },
    ],
    payments: [
      {
        id: AUTO_PAY_ID++,
        invoiceId: 1,
        method: "transfer",
        paidAmount: 470000,
        paidAt: todayISO(),
      },
    ],
    note: "",
  },
  {
    id: AUTO_INV_ID++,
    code: "INV-0008",
    patientId: 198,
    patientName: "Trần Văn H",
    appointmentId: 5002,
    createdAt: todayISO(),
    status: "Chưa thanh toán",
    items: [
      {
        id: AUTO_ITEM_ID++,
        type: "exam",
        name: "Phí khám",
        qty: 1,
        unitPrice: 100000,
        amount: 100000,
      },
      {
        id: AUTO_ITEM_ID++,
        type: "drug",
        name: "Paracetamol 500mg",
        qty: 2,
        unitPrice: 15000,
        amount: 30000,
      },
    ],
    payments: [
      {
        id: AUTO_PAY_ID++,
        invoiceId: 1,
        method: "wallet",
        paidAmount: 0,
        paidAt: todayISO(),
      },
    ],
    note: "",
  },
];


const hasInvoiceForAppointment = (appointmentId: number) =>
  MOCK_INVOICES.some((i) => i.appointmentId === appointmentId);

export async function apiCompletedVisitsPendingBilling(): Promise<
  CompletedVisit[]
> {
  await delay(120);
  return MOCK_COMPLETED_VISITS.filter(
    (v) => !hasInvoiceForAppointment(v.appointmentId)
  );
}

export async function apiInvoiceList(params?: {
  q?: string;
  status?: InvoiceStatus | "all";
  dateFrom?: string;
  dateTo?: string;
}): Promise<Invoice[]> {
  await delay(150);
  let arr = [...MOCK_INVOICES].sort((a, b) => b.id - a.id);
  if (params?.status && params.status !== "all")
    arr = arr.filter((i) => i.status === params.status);
  if (params?.q) {
    const q = params.q.toLowerCase();
    arr = arr.filter(
      (i) =>
        i.patientName.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q)
    );
  }
  if (params?.dateFrom)
    arr = arr.filter(
      (i) => new Date(i.createdAt) >= new Date(params.dateFrom!)
    );
  if (params?.dateTo)
    arr = arr.filter((i) => new Date(i.createdAt) <= new Date(params.dateTo!));
  return arr;
}

export async function apiInvoiceGet(id: number): Promise<Invoice> {
  await delay(120);
  const inv = MOCK_INVOICES.find((i) => i.id === id);
  if (!inv) throw new Error("Không tìm thấy hoá đơn");
  return JSON.parse(JSON.stringify(inv));
}

export async function apiInvoiceCreate(
  payload: Omit<Invoice, "id" | "code" | "createdAt">
): Promise<Invoice> {
  await delay(150);
  const id = AUTO_INV_ID++;
  const inv: Invoice = {
    id,
    code: `INV-${String(id).padStart(4, "0")}`,
    createdAt: todayISO(),
    ...payload,
  };
  // cấp id cho item
  inv.items = inv.items.map((it) => ({
    ...it,
    id: AUTO_ITEM_ID++,
    amount: it.unitPrice * it.qty,
  }));
  MOCK_INVOICES.push(inv);
  return inv;
}

export async function apiInvoiceAddPayment(
  invoiceId: number,
  method: PaymentMethod,
  paidAmount: number,
  txnRef?: string
): Promise<Payment> {
  await delay(150);
  const inv = MOCK_INVOICES.find((i) => i.id === invoiceId);
  if (!inv) throw new Error("Không tìm thấy hoá đơn");
  const p: Payment = {
    id: AUTO_PAY_ID++,
    invoiceId,
    method,
    paidAmount,
    txnRef,
    paidAt: todayISO(),
  };
  inv.payments.push(p);
  return p;
}

export async function apiInvoiceUpdateStatus(
  invoiceId: number,
  status: InvoiceStatus
): Promise<void> {
  await delay(100);
  const inv = MOCK_INVOICES.find((i) => i.id === invoiceId);
  if (!inv) throw new Error("Không tìm thấy hoá đơn");
  inv.status = status;
}
