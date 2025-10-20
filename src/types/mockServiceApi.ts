import type { ServiceID, ServiceItem, ServiceStatus } from "./service";


const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let AUTO = 2000;
let ITEMS: ServiceItem[] = [
  {
    id: AUTO++,
    code: "KHAM01",
    name: "Khám nội tổng quát",
    kind: "exam",
    unit: "lượt",
    price: 120000,
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
    price: 90000,
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
    price: 45000,
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
    price: 150000,
    department: "CĐHA",
    status: "inactive",
    createdAt: new Date().toISOString(),
  },
];

export async function apiListServices(): Promise<ServiceItem[]> {
  await delay(200);
  return [...ITEMS];
}

export async function apiCreateService(
  payload: Omit<ServiceItem, "id" | "createdAt">
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
  payload: Partial<Omit<ServiceItem, "id" | "createdAt">>
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
