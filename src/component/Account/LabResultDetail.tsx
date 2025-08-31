export type LabStatus =
  | "pending"
  | "processing"
  | "completed"
  | "abnormal"
  | "canceled";

export interface LabTestItem {
  id: number;
  analyte: string;
  result: string;
  unit?: string;
  refRange?: string;
  flag?: "H" | "L" | "A" | "N"; // H: cao, L: thấp, A: bất thường, N: bình thường
  note?: string;
}

export interface PatientInfo {
  code?: string;
  full_name: string;
  dob?: string;
  sex?: "M" | "F" | "O";
}

export interface LabResultDetail {
  id: number;
  result_code: string;
  collected_at: string;
  reported_at?: string;
  sample_type?: string;
  service_name: string;
  ordered_by?: string;
  status: LabStatus;
  patient: PatientInfo;
  items: LabTestItem[];
  notes?: string;
  warnings?: string[];
}

const StatusBadge = ({ status }: { status: LabStatus }) => {
  const map: Record<LabStatus, { cls: string; text: string }> = {
    pending: { cls: "bg-yellow-100 text-yellow-700", text: "Chờ xử lý" },
    processing: { cls: "bg-blue-100 text-blue-500", text: "Đang xử lý" },
    completed: { cls: "bg-green-100 text-green-600", text: "Bình thường" },
    abnormal: { cls: "bg-red-100 text-red-600", text: "Bất thường" },
    canceled: { cls: "bg-gray-200 text-gray-600", text: "Đã hủy" },
  };
  const m = map[status];
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${m.cls}`}
    >
      {m.text}
    </span>
  );
};

const Meta = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-600">{label}</span>
    <span className="font-bold text-right">{value ?? "-"}</span>
  </div>
);

export default function LabResultDetails({
  result,
}: {
  result: LabResultDetail;
}) {
  const flagCls = (f?: LabTestItem["flag"]) =>
    f === "H" || f === "L" || f === "A"
      ? "text-red-600 font-semibold"
      : "text-slate-700";
  const flagSign = (f?: LabTestItem["flag"]) =>
    f === "H" ? "↑" : f === "L" ? "↓" : f === "A" ? "!" : "";

  return (
    <div className="w-full">
      {/* ===== Tổng quan ===== */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
        {/* Tiêu đề (chiếm 2 cột trên sm+) */}
        <h2 className="sm:col-span-2 flex items-baseline justify-center sm:justify-start gap-2 text-xl sm:text-2xl font-bold m-0 min-w-0">
          <span className="truncate">Kết quả xét nghiệm</span>
          <span className="text-sky-500 whitespace-nowrap">
            #{result.result_code}
          </span>
        </h2>

        {/* Trạng thái (luôn canh phải trên sm+) */}
        <div className="justify-self-center sm:justify-self-end">
          <StatusBadge status={result.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Bác sĩ / dịch vụ */}
        <div className="rounded-xl space-y-2 border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-lg mb-2">Thông tin phiếu xét nghiệm</h2>
          <Meta label="Mã phiếu" value={result.result_code} />
          <Meta label="Ngày lấy mẫu" value={result.collected_at} />
          {result.reported_at && (
            <Meta label="Ngày có KQ" value={result.reported_at} />
          )}
          <Meta label="Loại mẫu" value={result.sample_type} />
          <Meta label="Dịch vụ" value={result.service_name} />
          {result.ordered_by && (
            <Meta label="Bác sĩ chỉ định" value={result.ordered_by} />
          )}
        </div>

        {/* Bệnh nhân (+ Diagnosis ở đây) */}
        <div className="rounded-xl space-y-2 border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-lg mb-2">Thông tin bệnh nhân</h2>
          <Meta label="Mã bệnh nhân" value={result.patient?.code} />
          <Meta label="Họ và tên" value={result.patient?.full_name} />
          {result.patient?.dob && (
            <Meta label="Ngày sinh" value={result.patient.dob} />
          )}
          <Meta
            label="Giới tính"
            value={
              result.patient?.sex === "M"
                ? "Nam"
                : result.patient?.sex === "F"
                ? "Nữ"
                : result.patient?.sex === "O"
                ? "Khác"
                : "-"
            }
          />
        </div>
      </div>

      {/* ===== Bảng chỉ số ===== */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Xét nghiệm</th>
              <th className="px-6 py-3">Kết quả</th>
              <th className="px-6 py-3">Đơn vị</th>
              <th className="px-6 py-3">Khoảng tham chiếu</th>
              <th className="px-6 py-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.items.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {t.analyte}
                </td>
                <td className={`px-6 py-3 ${flagCls(t.flag)}`}>
                  {t.result} <span className="ml-1">{flagSign(t.flag)}</span>
                </td>
                <td className="px-6 py-3">{t.unit ?? "-"}</td>
                <td className="px-6 py-3">{t.refRange ?? "-"}</td>
                <td className="px-6 py-3">{t.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Ghi chú & Cảnh báo ===== */}
      {(result.notes || result.warnings?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {result.notes && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-bold mb-2">Ghi chú</div>
              <p className="text-slate-700">- {result.notes}</p>
            </div>
          )}
          {result.warnings?.length ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-bold mb-2 text-red-600">Cảnh báo</div>
              <ul className="space-y-1 text-slate-700 list-none pl-0">
                {result.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="relative pl-4 before:absolute before:left-0 before:text-slate-500 before:content-['-']"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
