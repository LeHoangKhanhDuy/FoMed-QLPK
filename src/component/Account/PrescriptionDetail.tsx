import {
  User,
  Stethoscope,
  Activity,
  Clock,
  AlertTriangle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";

export type PrescriptionStatus =
  | "issued"
  | "dispensed"
  | "partially_dispensed"
  | "expired"
  | "canceled";

export type MealTiming = "before" | "after" | "with" | "any";

export type Route =
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

export interface PrescribedDrug {
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

export interface PrescriptionDetail {
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
  patient?: {
    code?: string;
    full_name: string;
    dob?: string;
    sex?: "M" | "F" | "O";
    diagnosis: string;
    allergies?: string[];
  };
  items: PrescribedDrug[];
  notes?: string;
  warnings?: string[];
  eRxCode?: string;
  qrCodeUrl?: string;
}

// ===== NEW: API Response Types =====
export interface ApiPrescriptionItem {
  medicineName: string;
  dose: string;
  duration: string;
  quantity: number;
}

export interface PrescriptionDetailData {
  code: string;
  prescribedAt: string;
  doctorName: string;
  diagnosis: string;
  items: ApiPrescriptionItem[];
  advice?: string;
}

// ===== MAPPER FUNCTION =====
function mapApiDataToComponentFormat(
  apiData: PrescriptionDetailData
): PrescriptionDetail {
  return {
    id: Date.now(),
    rx_code: apiData.code,
    issued_at: apiData.prescribedAt,
    valid_until: undefined,
    status: "issued",
    record_code: apiData.code,
    doctor_name: apiData.doctorName,
    doctor_license: undefined,
    service_name: "Khám bệnh",
    department: undefined,
    patient: {
      full_name: "Thông tin được bảo mật",
      dob: undefined,
      sex: "O",
      diagnosis: apiData.diagnosis,
      allergies: undefined,
      code: undefined,
    },
    items: apiData.items.map((item, index) => ({
      id: index + 1,
      drugName: item.medicineName,
      dosageText: item.dose,
      quantityPrescribed: item.quantity,
      instructions: item.duration,
      strength: undefined,
      form: "Viên",
      route: undefined,
      durationDays: undefined,
      mealTiming: undefined,
      warnings: undefined,
    })),
    notes: apiData.advice,
    warnings: undefined,
    eRxCode: undefined,
    qrCodeUrl: undefined,
  };
}

// ================= HELPERS =================
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const translateStatus = (status: PrescriptionStatus) => {
  switch (status) {
    case "issued":
      return {
        text: "Mới phát",
        color: "bg-blue-100 text-blue-700 border-blue-200",
      };
    case "dispensed":
      return {
        text: "Đã cấp thuốc",
        color: "bg-green-100 text-green-700 border-green-200",
      };
    case "partially_dispensed":
      return {
        text: "Cấp một phần",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    case "expired":
      return {
        text: "Hết hạn",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      };
    case "canceled":
      return {
        text: "Đã hủy",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    default:
      return { text: status, color: "bg-gray-100 text-gray-700" };
  }
};

const translateMealTiming = (timing?: MealTiming) => {
  switch (timing) {
    case "before":
      return "Trước ăn";
    case "after":
      return "Sau ăn";
    case "with":
      return "Trong khi ăn";
    case "any":
      return "Lúc nào cũng được";
    default:
      return "";
  }
};

// ================= COMPONENT =================
interface PrescriptionDetailsProps {
  rx?: PrescriptionDetailData | null;
  onBack?: () => void;
}

export default function PrescriptionDetails({
  rx,
  onBack,
}: PrescriptionDetailsProps) {
  // 1. Kiểm tra an toàn
  if (!rx) {
    return (
      <div className="p-4 text-center text-gray-500">
        Đang tải thông tin đơn thuốc...
      </div>
    );
  }

  // 2. Convert API data to component format
  const prescriptionData: PrescriptionDetail = mapApiDataToComponentFormat(rx);
  const statusInfo = translateStatus(prescriptionData.status);
  const patient = prescriptionData.patient || {
    full_name: "Không xác định",
    code: "-",
    sex: "O" as const,
    dob: "",
    allergies: [],
    diagnosis: "Không có thông tin",
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-10">
      {/* BACK BUTTON */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sky-500 hover:text-sky-600 transition font-medium mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Đơn thuốc{" "}
            <span className="text-sky-600">
              #{prescriptionData.rx_code || "---"}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mã hồ sơ:{" "}
            <span className="font-medium text-gray-700">
              {prescriptionData.record_code || "-"}
            </span>
          </p>
        </div>
        <div
          className={clsx(
            "px-3 py-1 rounded-full text-sm font-semibold border",
            statusInfo.color
          )}
        >
          {statusInfo.text}
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Bệnh nhân */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sky-500 font-semibold border-b border-gray-100 pb-2">
            <User className="w-5 h-5" /> Thông tin bệnh nhân
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Họ tên:</span>
              <span className="font-medium text-gray-900 uppercase">
                {patient.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mã BN:</span>
              <span className="font-medium">{patient.code || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Giới tính:</span>
              <span className="font-medium">
                {patient.sex === "M"
                  ? "Nam"
                  : patient.sex === "F"
                  ? "Nữ"
                  : "Khác"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày sinh:</span>
              <span className="font-medium">
                {patient.dob ? formatDate(patient.dob).split(" ")[0] : "-"}
              </span>
            </div>
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                <span className="text-red-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Dị ứng:
                </span>
                <p className="text-red-600 mt-1">
                  {patient.allergies.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Bác sĩ */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-green-500 font-semibold border-b border-gray-100 pb-2">
            <Stethoscope className="w-5 h-5" /> Thông tin khám
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Bác sĩ:</span>
              <span className="font-medium text-gray-900">
                {prescriptionData.doctor_name || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Chuyên khoa:</span>
              <span className="font-medium">
                {prescriptionData.department ||
                  prescriptionData.service_name ||
                  "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày kê:</span>
              <span className="font-medium">
                {formatDate(prescriptionData.issued_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hiệu lực đến:</span>
              <span className="font-medium text-orange-600">
                {prescriptionData.valid_until
                  ? formatDate(prescriptionData.valid_until).split(" ")[0]
                  : "N/A"}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
              <div className="text-gray-500 flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3" /> Chẩn đoán:
              </div>
              <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                {patient.diagnosis || "Chưa có chẩn đoán"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE: Danh sách thuốc */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-sky-500 px-6 py-3 border-b border-gray-200 font-semibold text-white flex justify-between items-center">
          <span>Chi tiết thuốc</span>
          <span className="text-xs font-normal text-gray-700 bg-white px-2 py-1 rounded border">
            Số lượng thuốc: {prescriptionData.items?.length || 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          {!prescriptionData.items || prescriptionData.items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Không có thuốc nào được kê.
            </div>
          ) : (
            <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
              <thead className="bg-sky-50 text-sky-800 font-semibold">
                <tr>
                  <th className="px-6 py-3 w-[5%]">#</th>
                  <th className="px-6 py-3 w-[25%]">Tên thuốc / Hoạt chất</th>
                  <th className="px-6 py-3 w-[15%]">Đơn vị</th>
                  <th className="px-6 py-3 w-[10%] text-center">SL</th>
                  <th className="px-6 py-3 w-[45%]">Hướng dẫn sử dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prescriptionData.items.map((d, index) => (
                  <tr
                    key={d.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">
                        {d.drugName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {[d.strength, d.form].filter(Boolean).join(" • ")}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block text-xs font-medium">
                        {d.form || "Viên"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-lg text-sky-600">
                        {d.quantityPrescribed}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                            {d.dosageText}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
                          {d.route && (
                            <span className="flex items-center gap-1">
                              • Đường dùng:{" "}
                              <span className="font-medium">{d.route}</span>
                            </span>
                          )}
                          {d.mealTiming && (
                            <span className="flex items-center gap-1">
                              • <Clock className="w-3 h-3 text-orange-500" />
                              <span className="italic">
                                {translateMealTiming(d.mealTiming)}
                              </span>
                            </span>
                          )}
                          {d.durationDays && (
                            <span className="flex items-center gap-1">
                              • Dùng trong:{" "}
                              <span className="font-medium">
                                {d.durationDays} ngày
                              </span>
                            </span>
                          )}
                        </div>

                        {d.instructions && (
                          <div className="text-gray-500 text-sm italic mt-1">
                            " {d.instructions} "
                          </div>
                        )}

                        {d.warnings && d.warnings.length > 0 && (
                          <div className="text-red-500 text-xs mt-1 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{d.warnings.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FOOTER */}
      {(prescriptionData.notes ||
        (prescriptionData.warnings &&
          prescriptionData.warnings.length > 0)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Lời dặn của bác sĩ
          </h3>
          <div className="space-y-3">
            {prescriptionData.notes && (
              <div>
                <span className="font-semibold text-amber-900 text-sm">
                  Ghi chú:{" "}
                </span>
                <span className="text-amber-900 text-sm">
                  {prescriptionData.notes}
                </span>
              </div>
            )}
            {prescriptionData.warnings &&
              prescriptionData.warnings.length > 0 && (
                <div>
                  <span className="font-semibold text-red-600 text-sm">
                    Cảnh báo quan trọng:{" "}
                  </span>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-red-700">
                    {prescriptionData.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
