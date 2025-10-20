// types/mockServiceApi.ts
export type ServiceID = number;
export type ServiceKind = "exam" | "lab" | "imaging" | "procedure";
export type ServiceStatus = "active" | "inactive";
export type Specimen = "blood" | "urine" | "swab" | "stool" | "other";
export type Department = "Khám bệnh" | "XN Huyết học" | "XN Sinh hoá" | "CĐHA";

/** Kiểu ServiceItem dành cho trang quản trị */
export interface ServiceItem {
  id: ServiceID;
  code: string;
  name: string;
  kind: ServiceKind;
  unit?: string | null;
  price: number;
  specimen?: Specimen | null; // chỉ dùng khi kind === "lab"
  department?: Department | string | null;
  status: ServiceStatus;
  createdAt: string; // ISO string
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let AUTO = 2000;
let ITEMS: ServiceItem[] = [
  {
    id: AUTO++,
    code: "KHAM01",
    name: "Khám nội tổng quát",
    kind: "exam",
    unit: "lượt",
    price: 120_000,
    department: "Khám bệnh",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: AUTO++,
    code: "CBC",
    name: "Tổng phân tích tế bào máu (CBC)",
    kind: "lab",
    unit: "mẫu",
    price: 90_000,
    specimen: "blood",
    department: "XN Huyết học",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: AUTO++,
    code: "GLU",
    name: "Đường huyết (Glucose)",
    kind: "lab",
    unit: "mẫu",
    price: 45_000,
    specimen: "blood",
    department: "XN Sinh hoá",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: AUTO++,
    code: "XQNGUC",
    name: "X-quang ngực thẳng",
    kind: "imaging",
    unit: "lần",
    price: 150_000,
    department: "CĐHA",
    status: "inactive",
    createdAt: new Date().toISOString(),
  },
];

export async function apiListServices(): Promise<ServiceItem[]> {
  await delay(200);
  return [...ITEMS];
}

export type CreatePayload = Omit<ServiceItem, "id" | "createdAt">;
export type UpdatePayload = Partial<Omit<ServiceItem, "id" | "createdAt">>;

export async function apiCreateService(
  payload: CreatePayload
): Promise<ServiceItem> {
  await delay(200);
  const it: ServiceItem = {
    ...payload,
    id: AUTO++,
    createdAt: new Date().toISOString(),
  };
  ITEMS.unshift(it);
  return it;
}

export async function apiUpdateService(
  id: ServiceID,
  payload: UpdatePayload
): Promise<ServiceItem> {
  await delay(200);
  const idx = ITEMS.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("Không tìm thấy dịch vụ");
  ITEMS[idx] = { ...ITEMS[idx], ...payload };
  return ITEMS[idx];
}

export async function apiToggleService(
  id: ServiceID,
  status: ServiceStatus
): Promise<ServiceItem> {
  return apiUpdateService(id, { status });
}

export async function apiDeleteService(id: ServiceID): Promise<void> {
  await delay(150);
  ITEMS = ITEMS.filter((s) => s.id !== id);
}
