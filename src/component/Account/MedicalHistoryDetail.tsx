import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

/* ====== Types ====== */
type PrescriptionStatus =
  | "issued"
  | "dispensed"
  | "partially_dispensed"
  | "expired"
  | "canceled";
type MealTiming = "before" | "after" | "with" | "any";
type Route =
  | "PO"
  | "IM"
  | "IV"
  | "Topical"
  | "Ophthalmic"
  | "Otic"
  | "Nasal"
  | "Inhalation"
  | "PR"
  | "SC";

interface PrescribedDrug {
  id: number;
  drugName: string;
  strength?: string;
  form?: string;
  route?: Route;
  dosageText: string;
  durationDays?: number;
  quantityPrescribed: number;
  instructions?: string;
  mealTiming?: MealTiming;
  warnings?: string[];
}

interface PrescriptionDetail {
  id: number;
  rx_code: string;
  issued_at: string;
  valid_until?: string;
  status: PrescriptionStatus;

  record_code: string;

  doctor_name: string;
  doctor_license?: string;
  service_name: string;
  department?: string;

  patient: {
    code?: string;
    full_name: string;
    dob?: string;
    sex?: "M" | "F" | "O";
    diagnosis: string; // ⬅️ diagnosis nằm trong patient
    allergies?: string[];
  };

  items: PrescribedDrug[];
  notes?: string;
  warnings?: string[];
  eRxCode?: string;
  qrCodeUrl?: string;
}

/* ====== Fake details ====== */
const FAKE_DETAILS: PrescriptionDetail[] = [
  {
    id: 5534,
    rx_code: "DTFM-5534",
    issued_at: "2025/08/01 10:30",
    valid_until: "2025/09/01 23:59",
    status: "issued",
    record_code: "HSFM-ABCDEF",
    doctor_name: "TS.BS Nguyễn Văn A",
    doctor_license: "79-12345",
    service_name: "Gói khám tổng quát",
    department: "Nội tổng quát",
    patient: {
      code: "BN000567",
      full_name: "Nguyễn Minh K",
      dob: "1995-04-12",
      sex: "M",
      diagnosis: "Cảm cúm",
      allergies: ["Penicillin"],
    },
    items: [
      {
        id: 1,
        drugName: "Paracetamol",
        strength: "500mg",
        form: "viên nén",
        route: "PO",
        dosageText: "1 viên x 3 lần/ngày",
        durationDays: 5,
        quantityPrescribed: 15,
        mealTiming: "after",
        instructions: "Uống sau ăn, cách nhau ≥ 4 giờ.",
        warnings: ["Không vượt 4g/ngày."],
      },
      {
        id: 2,
        drugName: "Acetylcysteine",
        strength: "200mg",
        form: "gói",
        route: "PO",
        dosageText: "1 gói x 2 lần/ngày",
        durationDays: 7,
        quantityPrescribed: 14,
        mealTiming: "with",
        instructions: "Hòa tan với nước ấm.",
      },
    ],
    notes: "Uống nhiều nước, nghỉ ngơi.",
    warnings: ["Bệnh nhân dị ứng Penicillin – tránh nhóm beta-lactam."],
    eRxCode: "ERX-9F3A-72KQ",
  },
  {
    id: 1234,
    rx_code: "DTFM-1234",
    issued_at: "2025/08/03 15:05",
    status: "dispensed",
    record_code: "HSFM-ABEREF",
    doctor_name: "TS.BS Nguyễn Văn A",
    service_name: "Gói khám tổng quát",
    department: "Hô hấp",
    patient: { full_name: "Lê Hoàng D", sex: "M", diagnosis: "Viêm họng cấp" },
    items: [
      {
        id: 1,
        drugName: "Azithromycin",
        strength: "500mg",
        form: "viên",
        route: "PO",
        dosageText: "1 viên/ngày",
        durationDays: 3,
        quantityPrescribed: 3,
        mealTiming: "any",
        instructions: "Uống cùng thời điểm mỗi ngày.",
      },
    ],
  },
  {
    id: 4334,
    rx_code: "DTFM-4334",
    issued_at: "2025/08/06 09:20",
    status: "partially_dispensed",
    record_code: "HSFM-UOCDEF",
    doctor_name: "TS.BS Nguyễn Văn A",
    service_name: "Gói khám tổng quát",
    department: "Tim mạch",
    patient: {
      full_name: "Phạm Thái B",
      sex: "M",
      diagnosis: "Tăng huyết áp độ 1",
    },
    items: [
      {
        id: 1,
        drugName: "Amlodipine",
        strength: "5mg",
        form: "viên",
        route: "PO",
        dosageText: "1 viên/ngày buổi sáng",
        durationDays: 30,
        quantityPrescribed: 30,
        mealTiming: "any",
        instructions: "Uống đều mỗi ngày.",
      },
    ],
  },
  {
    id: 1287,
    rx_code: "DTFM-1287",
    issued_at: "2025/07/01 08:10",
    status: "expired",
    record_code: "HSFM-LKHDEF",
    doctor_name: "TS.BS Nguyễn Văn A",
    service_name: "Gói khám tổng quát",
    department: "Dị ứng - Miễn dịch",
    patient: {
      full_name: "Nguyễn Thu H",
      sex: "F",
      diagnosis: "Dị ứng thời tiết",
    },
    items: [
      {
        id: 1,
        drugName: "Cetirizine",
        strength: "10mg",
        form: "viên",
        route: "PO",
        dosageText: "1 viên buổi tối",
        durationDays: 10,
        quantityPrescribed: 10,
      },
    ],
  },
  {
    id: 1353,
    rx_code: "DTFM-1353",
    issued_at: "2025-08-10 11:45",
    status: "canceled",
    record_code: "HSFM-1353REC",
    doctor_name: "TS.BS Nguyễn Văn A",
    service_name: "Gói khám tổng quát",
    department: "Da liễu",
    patient: { full_name: "Trần Mỹ L", sex: "F", diagnosis: "Viêm da cơ địa" },
    items: [
      {
        id: 1,
        drugName: "Hydrocortisone",
        strength: "1%",
        form: "kem bôi",
        route: "Topical",
        dosageText: "Bôi mỏng vùng tổn thương 2 lần/ngày",
        durationDays: 7,
        quantityPrescribed: 1,
        instructions: "Không bôi vết thương hở.",
      },
    ],
  },
];

/* ====== Helpers ====== */
const StatusBadge = ({ status }: { status: PrescriptionStatus }) => {
  let style = "";
  let text = "";
  switch (status) {
    case "issued":
      style = "bg-sky-100 text-sky-600";
      text = "Đã kê";
      break;
    case "dispensed":
      style = "bg-green-100 text-green-600";
      text = "Đã phát đủ";
      break;
    case "expired":
      style = "bg-gray-200 text-gray-600";
      text = "Hết hạn";
      break;
    case "canceled":
      style = "bg-red-100 text-red-600";
      text = "Đã hủy";
      break;
    default:
      style = "bg-gray-200 text-gray-600";
      text = "Không xác định";
  }
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${style}`}
    >
      {text}
    </span>
  );
};

const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-600">{label}</span>
    <span className="font-medium text-right">{value ?? "-"}</span>
  </div>
);

/* ====== Page ====== */
export default function MedicalHistoryDetails() {
  const { rxId } = useParams<{ rxId: string }>();

  // Lấy theo :rxId; nếu không có thì dùng phần tử đầu tiên
  const rx = useMemo(() => {
    const found = FAKE_DETAILS.find((d) => String(d.id) === String(rxId));
    return found ?? FAKE_DETAILS[0];
  }, [rxId]);

  const printPage = () => window.print();
  const downloadPdf = () => alert("Tải PDF (dữ liệu giả).");

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      {/* Header */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 items-center gap-3">
        {/* Tiêu đề: chiếm 2 cột trên md+ */}
        <h2 className="md:col-span-2 text-2xl font-bold text-center md:text-left m-0 min-w-0">
          Chi tiết hồ sơ khám bệnh
        </h2>

        {/* Nút: mobile ở giữa, md+ đẩy sang phải */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          <button
            onClick={printPage}
            className="h-9 rounded-[var(--rounded)] border px-3 text-sm bg-white hover:border-sky-400 cursor-pointer"
          >
            In đơn
          </button>
          <button
            onClick={downloadPdf}
            className="h-9 rounded-[var(--rounded)] bg-primary-linear text-white px-4 text-sm cursor-pointer"
          >
            Tải PDF
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div>
              Mã đơn thuốc:{" "}
              <span className="text-sky-500 font-bold">{rx.rx_code}</span>
            </div>
            <div>
              Mã hồ sơ:{" "}
              <Link
                to={`/user/medical-history/${rx.record_code}`}
                className="font-bold text-sky-500"
              >
                {rx.record_code}
              </Link>
            </div>
            <div>
              Ngày kê: <span className="font-bold">{rx.issued_at}</span>
            </div>
            {rx.valid_until && (
              <div>
                Hạn hiệu lực:{" "}
                <span className="font-bold">{rx.valid_until}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {rx.eRxCode && (
              <div className="text-sm text-slate-600">
                eRx: <span className="font-semibold">{rx.eRxCode}</span>
              </div>
            )}
            <StatusBadge status={rx.status} />
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Bác sĩ / dịch vụ */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-bold text-lg mb-2">Thông tin bác sĩ</div>
          <div className="space-y-2">
            <Field label="Bác sĩ" value={rx.doctor_name} />
            {rx.doctor_license && (
              <Field label="Số chứng chỉ" value={rx.doctor_license} />
            )}
            <Field label="Dịch vụ" value={rx.service_name} />
            {rx.department && (
              <Field label="Chuyên khoa" value={rx.department} />
            )}
          </div>
        </div>

        {/* Bệnh nhân (+ Diagnosis ở đây) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-bold text-lg mb-2">Thông tin bệnh nhân</div>
          <div className="space-y-2">
            <Field label="Họ và tên" value={rx.patient.full_name} />
            {rx.patient.code && (
              <Field label="Mã bệnh nhân" value={rx.patient.code} />
            )}
            {rx.patient.dob && (
              <Field label="Ngày sinh" value={rx.patient.dob} />
            )}
            {rx.patient.sex && (
              <Field
                label="Giới tính"
                value={
                  rx.patient.sex === "M"
                    ? "Nam"
                    : rx.patient.sex === "F"
                    ? "Nữ"
                    : "Khác"
                }
              />
            )}
            {/* ⬇️ Chẩn đoán chuyển xuống đây */}
            <Field label="Chẩn đoán" value={rx.patient.diagnosis} />
            {rx.patient.allergies && rx.patient.allergies.length > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">Dị ứng</span>
                <span className="font-medium text-right">
                  {rx.patient.allergies.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bảng thuốc */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Thuốc</th>
              <th className="px-6 py-3">Hàm lượng/Dạng</th>
              <th className="px-6 py-3">Ngày</th>
              <th className="px-6 py-3">Số lượng</th>
              <th className="px-6 py-3">Liều dùng</th>
              <th className="px-6 py-3">Hướng dẫn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rx.items.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {d.drugName}
                </td>
                <td className="px-6 py-3">
                  {[d.strength, d.form].filter(Boolean).join(" · ") || "-"}
                </td>
                <td className="px-6 py-3">{d.durationDays ?? "-"}</td>
                <td className="px-6 py-3">{d.quantityPrescribed}</td>
                <td className="px-6 py-3">
                  <div className="space-y-0.5">
                    <div className="font-medium">{d.dosageText}</div>
                    <div className="text-xs text-slate-500">
                      {d.route ? `Đường dùng: ${d.route}` : ""}
                      {d.mealTiming
                        ? ` · Bữa ăn: ${
                            d.mealTiming === "before"
                              ? "trước"
                              : d.mealTiming === "after"
                              ? "sau"
                              : d.mealTiming === "with"
                              ? "cùng"
                              : "không yêu cầu"
                          }`
                        : ""}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="space-y-0.5">
                    <div>{d.instructions ?? "-"}</div>
                    {d.warnings && d.warnings.length > 0 && (
                      <div className="text-xs text-red-600">
                        ⚠ {d.warnings.join("; ")}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ghi chú & Cảnh báo */}
      {(rx.notes || (rx.warnings && rx.warnings.length)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {rx.notes && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-bold mb-2">Ghi chú</div>
              <p className="text-slate-700">- {rx.notes}</p>
            </div>
          )}
          {rx.warnings && rx.warnings.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-bold mb-2 text-red-600">Cảnh báo</div>
              <ul className="space-y-1 text-slate-700 list-none pl-0">
                {rx.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="relative pl-4 before:absolute before:left-0 before:text-slate-500 before:content-['-']"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
