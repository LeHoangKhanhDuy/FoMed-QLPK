export type DrugID = number;
export type DrugStatus = "in stock" | "out of stock";

export interface DrugItem {
  id: DrugID;
  code: string; // mã thuốc (tùy chọn)
  name: string; // tên thuốc
  unit: string; // viên, ống, gói, ml...
  price: number; // đơn giá (VNĐ)
  stock: number; // tồn kho hiện tại
  status: DrugStatus;
  createdAt: string; // ISO
}
