export type DrugID = number;
export type DrugStatus = "in stock" | "out of stock";

/** Mô hình chuẩn hoá cho FE */
export interface DrugItem {
  id: DrugID;
  code: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  physicalStock: number;
  status: DrugStatus;
  isActive: boolean;
  createdAt: string | null;
}
