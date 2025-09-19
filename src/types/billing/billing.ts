export type InvoiceStatus =
  | "Nháp"
  | "Đã thanh toán"
  | "Chưa thanh toán"
  | "Hoàn tiền"
  | "Hủy";

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

export type PaymentMethod = "cash" | "card" | "transfer" | "wallet";

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

export type CompletedVisit = {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  finishedAt: string; // ISO
  // Các gợi ý tính phí (tuỳ chọn, BE có thì dùng)
  examFee?: number;
  services?: Array<{ id?: number; name: string; price: number }>;
  drugs?: Array<{ id?: number; name: string; qty: number; unitPrice: number }>;
};


export const calcSubTotal = (items: InvoiceItem[]) =>
  items.reduce((s, it) => s + it.amount, 0);

export const calcPaid = (payments: Payment[]) =>
  payments.reduce((s, p) => s + p.paidAmount, 0);

export const calcDue = (inv: Invoice) =>
  Math.max(0, calcSubTotal(inv.items) - calcPaid(inv.payments));
