// InvoiceView.tsx
import { Printer, ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

/* ===== Types ===== */
type InvoiceItem = {
  id: number;
  name: string;
  category: "Exam" | "Service" | "Drug" | "Package";
  qty: number;
  price: number;
  imageUrl?: string;
};

type PatientInfo = {
  fullName: string;
  email?: string;
  phone?: string;
  note?: string;
  code?: string; // mã hồ sơ / bệnh án
  dob?: string; // dd/mm/yyyy
  gender?: "Nam" | "Nữ" | "Khác";
};

type DoctorInfo = {
  fullName: string;
  specialty?: string;
  clinicName?: string;
  phone?: string;
  email?: string;
};

type PaymentInfo = {
  subTotal: number;
  discount: number;
  total: number;
  method?: "Tiền mặt" | "Chuyển khoản" | "Thẻ ngân hàng" | "Ví điện tử";
  status: "Đã thanh toán" | "Chưa thanh toán" | "Thanh toán một phần";
  paidAt?: string; // "HH:mm:ss dd/MM/yyyy"
};

type InvoiceData = {
  id: string; // e.g. INV-0008
  createdAt: string; // "HH:mm:ss dd/MM/yyyy"
  items: InvoiceItem[];
  patient: PatientInfo;
  doctor: DoctorInfo;
  payment: PaymentInfo;
};

/* ===== Helpers ===== */
const vnd = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";

const pillClassByStatus = (s: PaymentInfo["status"]) => {
  if (s === "Đã thanh toán")
    return "bg-green-50 text-green-500 border-green-200";
  if (s === "Thanh toán một phần")
    return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-rose-50 text-rose-600 border-rose-200";
};

/* ===== Component ===== */
export default function InvoiceView({
  data = demoData,
}: {
  data?: InvoiceData;
  onBack?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}) {
  const { id, createdAt, items, patient, doctor, payment } = data;
  const nav = useNavigate();

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold">
            Hoá đơn <span className="text-slate-500">#{id}</span>
          </h1>
        </div>
        <button
          className="h-10 px-3 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 cursor-pointer"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" /> In hoá đơn
        </button>
      </header>

      {/* Order meta */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="grid md:grid-cols-3 gap-4 p-3">
          <div className="flex items-center gap-2">
            <p className="text-sm">Mã hoá đơn: </p>
            <p className="font-semibold text-sky-400">#{id}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm">Ngày tạo:</p>
            <p className="font-semibold">{createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm">Trạng thái:</p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm border ${pillClassByStatus(
                payment.status
              )}`}
            >
              {payment.status}
            </span>
          </div>
        </div>
      </div>
      {/* Product / service block (giống layout mẫu) */}
      {/* Bảng chi tiết dịch vụ/thuốc */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm bg-white">
          <thead>
            <tr className="bg-sky-400 text-center text-white">
              <th className="py-2 pr-3">STT</th>
              <th className="py-2 pr-3">Tên dịch vụ</th>
              <th className="py-2 pr-3">Loại</th>
              <th className="py-2 pr-3">Số lượng</th>
              <th className="py-2 pr-3">Đơn giá</th>
              <th className="py-2 pr-3">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  Không có dịch vụ/thuốc
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr
                  key={it.id}
                  className="text-center border-b last:border-none"
                >
                  <td className="py-2 pr-3">{idx + 1}</td>
                  <td className="py-2 pr-3 font-medium">{it.name}</td>
                  <td className="py-2 pr-3">{it.category}</td>
                  <td className="py-2 pr-3">{it.qty}</td>
                  <td className="py-2 pr-3">{vnd(it.price)}</td>
                  <td className="py-2 pr-3 text-red-500 font-bold">
                    {vnd(it.price * it.qty)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2 cột info + payment info giống layout mẫu */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Thông tin bệnh nhân */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:col-span-1">
          <h3 className="font-semibold">Thông tin bệnh nhân</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Họ và tên" value={patient.fullName} />
            {patient.code && <Row label="Mã hồ sơ" value={patient.code} />}
            {patient.dob && <Row label="Ngày sinh" value={patient.dob} />}
            {patient.gender && <Row label="Giới tính" value={patient.gender} />}
            <Row label="Email" value={patient.email ?? "-"} />
            <Row label="Số điện thoại" value={patient.phone ?? "-"} />
            <Row label="Ghi chú" value={patient.note ?? "-"} />
          </div>
        </div>

        {/* Thông tin bác sĩ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:col-span-1">
          <h3 className="font-semibold">Thông tin bác sĩ</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Họ và tên" value={doctor.fullName} />
            <Row label="Chuyên khoa" value={doctor.specialty ?? "-"} />
            <Row label="Cơ sở" value={doctor.clinicName ?? "-"} />
            <Row label="Email" value={doctor.email ?? "-"} />
            <Row label="Số điện thoại" value={doctor.phone ?? "-"} />
          </div>
        </div>

        {/* Thông tin thanh toán */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:col-span-1">
          <h3 className="font-semibold">Thông tin thanh toán</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Tiền dịch vụ" value={vnd(payment.subTotal)} />
            <Row label="Giảm giá" value={vnd(payment.discount)} />
            <Row
              label={<span className="font-medium">Tổng thanh toán</span>}
              value={
                <span className="text-red-500 font-bold">
                  {vnd(payment.total)}
                </span>
              }
            />
            {payment.method && (
              <Row label="Phương thức" value={payment.method} />
            )}
            {payment.paidAt && (
              <Row label="Thời gian thanh toán" value={payment.paidAt} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Small row component ===== */
function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-1 text-slate-500">{label}</div>
      <div className="col-span-2 font-medium">{value}</div>
    </div>
  );
}

/* ===== Demo data (thay bằng API của bạn) ===== */
const demoData: InvoiceData = {
  id: "INV-0008",
  createdAt: "18:24:01 19/09/2025",
  items: [
    {
      id: 9,
      name: "Khám tổng quát",
      category: "Exam",
      qty: 1,
      price: 100_000,
      imageUrl:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/https://cms-prod.s3-sgn09.fptcloud.com/kham_suc_khoe_tong_quat_gom_nhung_gi_ban_da_biet_chua_yc_Ef_I_1663470300_a1b3bcd6aa.jpg",
    },
    {
      id: 10,
      name: "Paracetamol 500mg",
      category: "Drug",
      qty: 2,
      price: 15_000,
    },
  ],
  patient: {
    fullName: "Trần Văn H",
    email: "bestyasuo31@gmail.com",
    phone: "0855565715",
    note: "-",
    code: "#5003",
    dob: "01/01/1998",
    gender: "Nam",
  },
  doctor: {
    fullName: "BS. Nguyễn Minh An",
    specialty: "Chẩn đoán hình ảnh",
    clinicName: "Phòng khám FoMed",
    email: "doctor.an@example.com",
    phone: "0901 234 567",
  },
  payment: {
    subTotal: 130_000,
    discount: 0,
    total: 130_000,
    status: "Đã thanh toán",
    method: "Ví điện tử",
    paidAt: "18:25:03 19/09/2025",
  },
};
