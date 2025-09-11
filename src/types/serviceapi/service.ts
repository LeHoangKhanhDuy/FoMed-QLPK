export type ServiceID = number;

export type ServiceKind = "exam" | "lab" | "imaging" | "procedure";
// Khám | Xét nghiệm | Chẩn đoán hình ảnh | Thủ thuật

export type ServiceStatus = "active" | "inactive";

export interface ServiceItem {
  id: ServiceID;
  code: string; // mã dịch vụ (ví dụ: KHAM01, CBC, XQNGUC)
  name: string; // tên dịch vụ
  kind: ServiceKind; // nhóm dịch vụ
  unit?: string; // lượt, lần, mẫu...
  price: number; // đơn giá (VNĐ)
  specimen?: "blood" | "urine" | "swab" | "stool" | "other"; // chỉ dùng cho lab
  department?: string; // khoa/phòng thực hiện
  status: ServiceStatus;
  createdAt: string; // ISO
}
