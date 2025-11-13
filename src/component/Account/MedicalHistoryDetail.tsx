import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  apiGetEncounterDetail,
  formatVietnameseDate,
  formatVietnameseDateOnly,
  parseGenderToSex,
  type EncounterDetail,
  type EncounterDetailDrug,
} from "../../services/encountersApi";
import {
  getProfile,
  readUserFromStorage,
  USER_TOKEN_KEY,
} from "../../services/auth";
import type { AppUser } from "../../types/auth/login";

/* ====== Types ====== */
type PrescriptionStatus =
  | "issued"
  | "dispensed"
  | "partially_dispensed"
  | "expired"
  | "canceled";

interface PrescribedDrug {
  id: number;
  drugName: string;
  strength?: string;
  form?: string;
  dosageText: string;
  duration?: string;
  quantityPrescribed: number;
  instructions?: string;
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
    diagnosis: string;
    allergies?: string[];
  };
  items: PrescribedDrug[];
  notes?: string;
  warnings?: string[];
  eRxCode?: string;
}

/* ====== Helpers ====== */
function normalizeGender(gender?: string | null) {
  if (!gender) return undefined;
  const normalized = gender.trim().toUpperCase();
  if (["M", "MALE", "NAM"].includes(normalized)) return "Nam";
  if (["F", "FEMALE", "NU", "NỮ"].includes(normalized)) return "Nữ";
  if (["O", "OTHER", "KHAC", "KHÁC"].includes(normalized)) return "Khác";
  return gender;
}

function formatProfileDateOnly(dateString?: string | null) {
  if (!dateString) return undefined;
  const isoDateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDateOnlyMatch.test(dateString)) {
    return formatVietnameseDateOnly(dateString);
  }
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

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

/* ====== Transform Backend -> Frontend ====== */
const transformEncounter = (enc: EncounterDetail): PrescriptionDetail => {
  return {
    id: 0,
    rx_code: enc.prescriptionCode || enc.encounterCode || "",
    issued_at: formatVietnameseDate(enc.visitAt),
    valid_until: enc.expiryAt ? formatVietnameseDate(enc.expiryAt) : undefined,
    status: (enc.erxStatus?.toLowerCase() || "issued") as PrescriptionStatus,
    record_code: enc.encounterCode || "",
    doctor_name: enc.doctorName || "",
    doctor_license: enc.licenseNo ?? undefined,
    service_name: enc.serviceName ?? "",
    department: enc.specialtyName ?? undefined,
    patient: {
      code: enc.patientCode ?? undefined,
      full_name: enc.patientFullName ?? "",
      dob: enc.patientDob
        ? formatVietnameseDateOnly(enc.patientDob)
        : undefined,
      sex: parseGenderToSex(enc.patientGender),
      diagnosis: enc.diagnosis ?? "",
      allergies: enc.allergy ? [enc.allergy] : undefined,
    },
    items: (enc.items ?? []).map((it: EncounterDetailDrug, idx: number) => ({
      id: idx + 1,
      drugName: it.medicineName,
      strength: it.strength ?? undefined,
      form: it.form ?? undefined,
      dosageText: it.dose ?? "",
      duration: it.duration ?? undefined,
      quantityPrescribed: it.quantity ?? 0,
      instructions: it.instruction ?? undefined,
    })),
    notes: enc.advice ?? undefined,
    warnings: enc.warning ? [enc.warning] : undefined,
    eRxCode: enc.erxCode ?? undefined,
  };
};

/* ====== Page Component ====== */
export default function MedicalHistoryDetails() {
  const { rxId } = useParams<{ rxId: string }>();
  const [fetched, setFetched] = useState<EncounterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientProfile, setPatientProfile] = useState<AppUser | null>(null);

  useEffect(() => {
    const id = rxId;
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiGetEncounterDetail(id);
        if (mounted) {
          setFetched(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết encounter:", err);
        const e = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };

        if (e?.response?.status === 404) {
          toast.error("Không tìm thấy hồ sơ khám bệnh");
        } else if (e?.response?.status === 403) {
          toast.error("Bạn không có quyền xem hồ sơ này");
        } else {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "Không thể tải chi tiết hồ sơ";
          toast.error(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [rxId]);

  useEffect(() => {
    let cancelled = false;
    const cached = readUserFromStorage();
    if (cached && !cancelled) {
      setPatientProfile(cached);
    }

    const token = localStorage.getItem(USER_TOKEN_KEY) || "";
    if (!token) return () => {
      cancelled = true;
    };

    getProfile(token)
      .then((profile) => {
        if (!cancelled) {
          setPatientProfile(profile);
        }
      })
      .catch((err) => {
        console.warn("Không thể tải thông tin profile:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rx = useMemo(() => {
    if (fetched) return transformEncounter(fetched);
    return null;
  }, [fetched]);

  const printPage = () => window.print();
  const downloadPdf = () => toast.success("Chức năng đang phát triển");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải chi tiết hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!rx) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 text-lg">
            Không tìm thấy hồ sơ khám bệnh
          </p>
          <Link
            to="/user/medical-history"
            className="text-sky-500 hover:underline mt-2 inline-block"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const patientDob =
    rx.patient.dob ||
    formatProfileDateOnly(patientProfile?.dateOfBirth) ||
    undefined;
  const patientGender =
    (rx.patient.sex && normalizeGender(rx.patient.sex)) ||
    normalizeGender(patientProfile?.gender) ||
    undefined;
  const patientPhone =
    patientProfile?.phone && patientProfile.phone.trim().length > 0
      ? patientProfile.phone
      : undefined;
  const patientEmail =
    patientProfile?.email && patientProfile.email.trim().length > 0
      ? patientProfile.email
      : undefined;
  const patientAddress =
    patientProfile?.address && patientProfile.address.trim().length > 0
      ? patientProfile.address
      : undefined;

  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="flex items-baseline gap-2 text-xl sm:text-2xl font-bold m-0">
          <span>Hồ sơ khám bệnh</span>
          <span className="text-sky-500">#{rx.rx_code}</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={printPage}
            className="h-9 rounded-lg border border-slate-300 px-4 text-sm bg-white hover:border-sky-400 transition-colors"
          >
            In đơn
          </button>
          <button
            onClick={downloadPdf}
            className="h-9 rounded-lg bg-sky-500 text-white px-4 text-sm hover:bg-sky-600 transition-colors"
          >
            Tải PDF
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 text-sm">
            <div>
              Mã đơn thuốc:{" "}
              <span className="text-sky-500 font-semibold">{rx.rx_code}</span>
            </div>
            <div>
              Mã hồ sơ:{" "}
              <Link
                to="/user/medical-history"
                className="font-semibold text-sky-500 hover:underline"
              >
                {rx.record_code}
              </Link>
            </div>
            <div>
              Ngày kê: <span className="font-semibold">{rx.issued_at}</span>
            </div>
            {rx.valid_until && (
              <div>
                Hạn hiệu lực:{" "}
                <span className="font-semibold">{rx.valid_until}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {rx.eRxCode && (
              <div className="text-sm text-slate-600">
                eRx: <span className="font-semibold">{rx.eRxCode}</span>
              </div>
            )}
            <StatusBadge status={rx.status} />
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Doctor Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-base mb-3">Thông tin bác sĩ</h3>
          <div className="space-y-2 text-sm">
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

        {/* Patient Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-base mb-3">Thông tin bệnh nhân</h3>
          <div className="space-y-2 text-sm">
            <Field
              label="Họ và tên"
              value={rx.patient.full_name || patientProfile?.name || undefined}
            />
            <Field label="Mã bệnh nhân" value={rx.patient.code} />
            <Field label="Ngày sinh" value={patientDob} />
            <Field label="Giới tính" value={patientGender} />
            <Field label="Số điện thoại" value={patientPhone} />
            <Field label="Email" value={patientEmail} />
            <Field label="Địa chỉ" value={patientAddress} />
            <Field label="Chẩn đoán" value={rx.patient.diagnosis} />
            {rx.patient.allergies && rx.patient.allergies.length > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">Dị ứng</span>
                <span className="font-medium text-right text-red-600">
                  {rx.patient.allergies.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-500 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">Thuốc</th>
                <th className="px-6 py-3 font-semibold">Hàm lượng/Dạng</th>
                <th className="px-6 py-3 font-semibold">Ngày</th>
                <th className="px-6 py-3 font-semibold">Số lượng</th>
                <th className="px-6 py-3 font-semibold">Liều dùng</th>
                <th className="px-6 py-3 font-semibold">Hướng dẫn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rx.items.length > 0 ? (
                rx.items.map((drug) => (
                  <tr
                    key={drug.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {drug.drugName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {[drug.strength, drug.form].filter(Boolean).join(" · ") ||
                        "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {drug.duration ? drug.duration.replace(/\D+/g, "") : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {drug.quantityPrescribed}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {drug.dosageText || "-"}
                      </div>
                      {drug.duration && (
                        <div className="text-xs text-slate-500 mt-1">
                          Đường dùng: PO · Bữa ăn: sau
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">
                        {drug.instructions || "-"}
                      </div>
                      {drug.instructions &&
                        drug.instructions.includes("4g") && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠ Không vượt 4g/ngày.
                          </div>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Chưa có đơn thuốc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes & Warnings */}
      {(rx.notes || (rx.warnings && rx.warnings.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rx.notes && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-base mb-3">Ghi chú</h3>
              <p className="text-sm text-slate-700">- {rx.notes}</p>
            </div>
          )}
          {rx.warnings && rx.warnings.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-base mb-3 text-red-600">
                Cảnh báo
              </h3>
              <ul className="space-y-1 text-sm text-slate-700 list-none pl-0">
                {rx.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="before:content-['-'] before:mr-2 before:text-slate-500"
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
