import type { LabResultDetail, LabStatus } from "../../types/lab/lab";


const StatusBadge = ({ status }: { status: LabStatus }) => {
  const map: Record<LabStatus, { cls: string; text: string }> = {
    pending: { cls: "bg-yellow-100 text-yellow-700", text: "Chờ xử lý" },
    processing: { cls: "bg-blue-100 text-blue-600", text: "Đang xử lý" },
    completed: { cls: "bg-green-100 text-green-700", text: "Hoàn tất" },
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

export function LabResultDetails({ result }: { result: LabResultDetail }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
        <h2 className="sm:col-span-2 text-xl sm:text-2xl font-bold">
          Kết quả xét nghiệm{" "}
          <span className="text-sky-600">#{result.result_code}</span>
        </h2>
        <div className="justify-self-start sm:justify-self-end">
          <StatusBadge status={result.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <div>
            <span className="text-slate-600">Loại mẫu:</span>{" "}
            <b>{result.sample_type ?? "-"}</b>
          </div>
          <div>
            <span className="text-slate-600">Chỉ định:</span>{" "}
            <b>{result.service_name}</b>
          </div>
          <div>
            <span className="text-slate-600">BS chỉ định:</span>{" "}
            <b>{result.ordered_by ?? "-"}</b>
          </div>
          <div>
            <span className="text-slate-600">Lấy mẫu:</span>{" "}
            <b>{result.collected_at ?? "-"}</b>
          </div>
          <div>
            <span className="text-slate-600">Trả kết quả:</span>{" "}
            <b>{result.reported_at ?? "-"}</b>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
          <div>
            <span className="text-slate-600">Mã BN:</span>{" "}
            <b>{result.patient.code}</b>
          </div>
          <div>
            <span className="text-slate-600">Họ tên:</span>{" "}
            <b>{result.patient.full_name}</b>
          </div>
          <div>
            <span className="text-slate-600">Ngày sinh:</span>{" "}
            <b>{result.patient.dob}</b>
          </div>
          <div>
            <span className="text-slate-600">Giới tính:</span>{" "}
            <b>{result.patient.sex}</b>
          </div>
        </div>
      </div>

      {/* Bảng chỉ số */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm text-gray-700">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-6 py-3">Xét nghiệm</th>
              <th className="px-6 py-3">Kết quả</th>
              <th className="px-6 py-3">ĐV</th>
              <th className="px-6 py-3">Khoảng tham chiếu</th>
              <th className="px-6 py-3">Cờ</th>
              <th className="px-6 py-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.items.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {i.analyte}
                </td>
                <td className="px-6 py-3">{i.result}</td>
                <td className="px-6 py-3">{i.unit ?? "-"}</td>
                <td className="px-6 py-3">{i.refRange ?? "-"}</td>
                <td
                  className={`px-6 py-3 font-semibold ${
                    i.flag === "H"
                      ? "text-red-600"
                      : i.flag === "L"
                      ? "text-orange-600"
                      : "text-slate-700"
                  }`}
                >
                  {i.flag ?? "-"}
                </td>
                <td className="px-6 py-3">{i.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes / Warnings */}
      {(result.notes || result.warnings?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {result.notes && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-bold mb-2">Ghi chú</div>
              <p className="text-slate-700 whitespace-pre-line">
                {result.notes}
              </p>
            </div>
          )}
          {result.warnings?.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-bold mb-2">Khuyến cáo</div>
              <ul className="list-disc ml-5 space-y-1">
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
