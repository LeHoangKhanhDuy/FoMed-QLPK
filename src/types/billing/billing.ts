export type InvoiceStatus = "draft" | "paid" | "refunded" | "void";

export type InvoiceItemType = "exam" | "service" | "drug";

export type InvoiceItem = {
  id: number;
  type: InvoiceItemType;
  refId?: number | null;
  name: string;
  qty: number;
  unitPrice: number;
  amount: number; // qty * unitPrice
};

export type PaymentMethod = "cash" | "card" | "transfer" | "online";

export type Payment = {
  id: number;
  invoiceId: number;
  method: PaymentMethod;
  paidAmount: number;
  txnRef?: string;
  paidAt: string; // ISO
};

export type Invoice = {
  id: number;
  code: string; // INV-0001
  patientId: number;
  patientName: string;
  appointmentId?: number | null; // có thể rỗng
  createdAt: string; // ISO
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: Payment[];
  note?: string;
};

export const calcSubTotal = (items: InvoiceItem[]) =>
  items.reduce((s, it) => s + it.amount, 0);

export const calcPaid = (payments: Payment[]) =>
  payments.reduce((s, p) => s + p.paidAmount, 0);

export const calcDue = (inv: Invoice) =>
  Math.max(0, calcSubTotal(inv.items) - calcPaid(inv.payments));
