import type { DrugID, DrugItem, DrugStatus } from "./drug";


const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let AUTO = 3000;
let ITEMS: DrugItem[] = [
  {
    id: AUTO++,
    code: "PARA500",
    name: "Paracetamol 500mg",
    unit: "viên",
    price: 1500,
    stock: 1200,
    status: "in stock",
    createdAt: new Date().toISOString(),
  },
  {
    id: AUTO++,
    code: "AMOX500",
    name: "Amoxicillin 500mg",
    unit: "viên",
    price: 2500,
    stock: 300,
    status: "out of stock",
    createdAt: new Date().toISOString(),
  },
  {
    id: AUTO++,
    code: "ORESOL",
    name: "Oresol",
    unit: "gói",
    price: 3500,
    stock: 50,
    status: "in stock",
    createdAt: new Date().toISOString(),
  },
];

export async function apiListDrugs(): Promise<DrugItem[]> {
  await delay(200);
  return [...ITEMS];
}

export async function apiCreateDrug(
  payload: Omit<DrugItem, "id" | "createdAt">
): Promise<DrugItem> {
  await delay(200);
  const it: DrugItem = {
    ...payload,
    id: AUTO++,
    createdAt: new Date().toISOString(),
  };
  ITEMS.unshift(it);
  return it;
}

export async function apiUpdateDrug(
  id: DrugID,
  payload: Partial<Omit<DrugItem, "id" | "createdAt">>
): Promise<DrugItem> {
  await delay(200);
  const idx = ITEMS.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Không tìm thấy thuốc");
  ITEMS[idx] = { ...ITEMS[idx], ...payload };
  return ITEMS[idx];
}

export async function apiToggleDrug(
  id: DrugID,
  status: DrugStatus
): Promise<DrugItem> {
  return apiUpdateDrug(id, { status });
}

export async function apiAdjustStock(
  id: DrugID,
  delta: number
): Promise<DrugItem> {
  await delay(150);
  const idx = ITEMS.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Không tìm thấy thuốc");
  ITEMS[idx] = { ...ITEMS[idx], stock: Math.max(0, ITEMS[idx].stock + delta) };
  return ITEMS[idx];
}

export async function apiDeleteDrug(id: DrugID): Promise<void> {
  await delay(150);
  ITEMS = ITEMS.filter((x) => x.id !== id);
}
