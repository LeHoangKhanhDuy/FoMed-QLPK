// src/components/prescription/PrescriptionDetailsView.tsx
// ❗ Loại bỏ các import không dùng (Link, ChevronLeft)
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
  qrCodeUrl?: string;
}

export default function PrescriptionDetails({
  rx,
}: {
  rx: PrescriptionDetail;
  hideHeader?: boolean; // giữ prop để không vỡ chỗ gọi, nhưng bỏ qua
  onBack?: () => void; // giữ prop để không vỡ chỗ gọi, nhưng bỏ qua
  onPrint?: () => void; // giữ prop để không vỡ chỗ gọi, nhưng bỏ qua
  onDownloadPdf?: () => void; // giữ prop để không vỡ chỗ gọi, nhưng bỏ qua
}) {
  return (
    <div className="md:flex-row min-h-screen p-4 mx-auto max-w-screen-2xl px-0 lg:px-0 gap-6">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
        <h2 className="text-2xl font-bold">Chi tiết đơn thuốc</h2>
      </div>

      {/* ========= BẢNG KÊ THUỐC ========= */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Thuốc</th>
              <th className="px-6 py-3">Hàm lượng/Dạng</th>
              <th className="px-6 py-3">Liều dùng</th>
              <th className="px-6 py-3">Ngày</th>
              <th className="px-6 py-3">Số lượng</th>
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
                <td className="px-6 py-3">{d.durationDays ?? "-"}</td>
                <td className="px-6 py-3">{d.quantityPrescribed}</td>
                <td className="px-6 py-3">
                  <div className="space-y-0.5">
                    <div>{d.instructions ?? "-"}</div>
                    {d.warnings?.length ? (
                      <ul className="space-y-0.5 text-xs text-red-600 list-none pl-0">
                        {d.warnings.map((w, i) => (
                          <li
                            key={i}
                            className="relative pl-4 before:absolute before:left-0 before:text-slate-500 before:content-['-']"
                          >
                            {w}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========= GHI CHÚ & CẢNH BÁO ========= */}
      {(rx.notes || rx.warnings?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {rx.notes && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-bold mb-2">Ghi chú</div>
              <p className="text-slate-700">{rx.notes}</p>
            </div>
          )}
          {rx.warnings?.length ? (
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
          ) : null}
        </div>
      )}
    </div>
  );
}
