// src/features/doctor/pages/DoctorPatientWorkspace.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, FlaskConical, Pill, Trash2 } from "lucide-react";
import type {
  DiagnosisPayload,
  LabItem,
  LabOrderPayload,
  PrescriptionLine,
  PrescriptionPayload,
} from "../../../types/doctor/doctor";
import SuccessModal from "../../../common/SuccessModal";
import { SelectMenu } from "../../ui/select-menu";

// ====== MOCK (thay bằng API thật) ======
const mockLabItems: LabItem[] = [
  { id: 1, code: "CBC", name: "Tổng phân tích tế bào máu", sample: "blood" },
  { id: 2, code: "GLU", name: "Đường huyết", sample: "blood" },
  { id: 3, code: "UA", name: "Nước tiểu tổng quát", sample: "urine" },
];
const mockDrugs: Array<{ id: number; name: string; unit: string }> = [
  { id: 10, name: "Paracetamol 500mg", unit: "viên" },
  { id: 11, name: "Amoxicillin 500mg", unit: "viên" },
  { id: 12, name: "Oresol", unit: "gói" },
];

async function submitDiagnosis(payload: DiagnosisPayload) {
  console.log("submitDiagnosis", payload);
}
async function submitLabOrder(payload: LabOrderPayload) {
  console.log("submitLabOrder", payload);
}
async function submitPrescription(payload: PrescriptionPayload) {
  console.log("submitPrescription", payload);
}
// ======================================

type TabKey = "dx" | "lab" | "rx";

export default function DoctorPatientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const nav = useNavigate();

  // Success modal: title + message động
  const [success, setSuccess] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });

  const [tab, setTab] = useState<TabKey>("dx");

  // state form đơn giản
  const [dx, setDx] = useState<DiagnosisPayload>({
    patientId,
    symptoms: "",
    diagnosis: "",
    note: "",
  });

  const [lab, setLab] = useState<LabOrderPayload>({
    patientId,
    items: [],
    note: "",
    priority: "normal",
  });

  const [rxLines, setRxLines] = useState<PrescriptionLine[]>([]);
  const [rxAdvice, setRxAdvice] = useState("");

  useEffect(() => {
    // load patient summary nếu cần
  }, [patientId]);

  const canSubmitDx = useMemo(
    () => dx.symptoms.trim().length > 0 && dx.diagnosis.trim().length > 0,
    [dx]
  );

  const canSubmitLab = useMemo(() => lab.items.length > 0, [lab]);

  const canSubmitRx = useMemo(
    () =>
      rxLines.length > 0 &&
      rxLines.every(
        (l) =>
          !!l.drugId && l.dose.trim() && l.frequency.trim() && l.duration.trim()
      ),
    [rxLines]
  );

  // tiện ích mở modal success
  const openSuccess = (title: string, message: string) =>
    setSuccess({ open: true, title, message });

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold">
            Hồ sơ khám bệnh — BN#{patientId}
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2 mb-4">
          <TabBtn
            id="dx"
            active={tab === "dx"}
            onClick={() => setTab("dx")}
            icon={<Stethoscope className="w-4 h-4" />}
          >
            Chẩn đoán
          </TabBtn>
          <TabBtn
            id="lab"
            active={tab === "lab"}
            onClick={() => setTab("lab")}
            icon={<FlaskConical className="w-4 h-4" />}
          >
            Xét nghiệm
          </TabBtn>
          <TabBtn
            id="rx"
            active={tab === "rx"}
            onClick={() => setTab("rx")}
            icon={<Pill className="w-4 h-4" />}
          >
            Kê toa
          </TabBtn>
        </div>

        {/* Panels */}
        {tab === "dx" && (
          <div className="space-y-3">
            <Field label="Triệu chứng">
              <textarea
                value={dx.symptoms}
                onChange={(e) => setDx({ ...dx, symptoms: e.target.value })}
                rows={3}
                className="w-full rounded-[var(--rounded)] border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Sốt, đau đầu,..."
              />
            </Field>
            <Field label="Chẩn đoán">
              <input
                value={dx.diagnosis}
                onChange={(e) => setDx({ ...dx, diagnosis: e.target.value })}
                className="w-full rounded-[var(--rounded)] border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Cảm lạnh,..."
              />
            </Field>
            <Field label="Ghi chú">
              <textarea
                value={dx.note ?? ""}
                onChange={(e) => setDx({ ...dx, note: e.target.value })}
                rows={3}
                className="w-full rounded-[var(--rounded)] border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: ..."
              />
            </Field>

            <div className="flex justify-start">
              <button
                disabled={!canSubmitDx}
                onClick={async () => {
                  await submitDiagnosis(dx);
                  openSuccess(
                    "Đã lưu chẩn đoán",
                    "Chẩn đoán đã được lưu thành công."
                  );
                  setTab("lab");
                }}
                className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                Lưu
              </button>
            </div>
          </div>
        )}

        {tab === "lab" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Danh mục xét nghiệm</p>
              <button
                onClick={() =>
                  setLab((l) => ({
                    ...l,
                    items: [...l.items, mockLabItems[0]?.id ?? 0],
                  }))
                }
                className="bg-primary-linear text-white cursor-pointer rounded-[var(--rounded)] px-3 py-1.5"
              >
                + Thêm
              </button>
            </div>

            {lab.items.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có chỉ định.</p>
            ) : (
              <div className="space-y-2">
                {lab.items.map((labId, idx) => (
                  <div key={`${labId}-${idx}`} className="flex gap-2">
                    <SelectMenu<number>
                      value={labId}
                      onChange={(v) =>
                        setLab((l) => ({
                          ...l,
                          items: l.items.map((x, i) =>
                            i === idx ? Number(v) : x
                          ),
                        }))
                      }
                      options={mockLabItems.map((s) => ({
                        value: s.id,
                        label: `${s.code} — ${s.name}`,
                      }))}
                    />

                    <button
                      onClick={() =>
                        setLab((l) => ({
                          ...l,
                          items: l.items.filter((_, i) => i !== idx),
                        }))
                      }
                      className="cursor-pointer rounded-md text-rose-600 px-2 py-1 text-xs"
                    >
                      <Trash2 className="w-5 h-5 hover:text-rose-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Field label="Ghi chú">
              <input
                value={lab.note ?? ""}
                onChange={(e) => setLab({ ...lab, note: e.target.value })}
                className="w-full rounded-[var(--rounded)] border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Đường trong máu cao"
              />
            </Field>

            <div className="flex justify-start">
              <button
                disabled={!canSubmitLab}
                onClick={async () => {
                  await submitLabOrder(lab);
                  openSuccess(
                    "Đã lưu chỉ định",
                    "Chỉ định xét nghiệm đã được lưu."
                  );
                  setTab("rx");
                }}
                className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                Lưu
              </button>
            </div>
          </div>
        )}

        {tab === "rx" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Danh mục thuốc</p>
              <button
                onClick={() =>
                  setRxLines((ls) => [
                    ...ls,
                    {
                      drugId: mockDrugs[0]?.id ?? 0,
                      dose: "",
                      frequency: "",
                      duration: "",
                    },
                  ])
                }
                className="bg-primary-linear text-white cursor-pointer rounded-[var(--rounded)] px-3 py-1.5 "
              >
                + Thêm thuốc
              </button>
            </div>

            {rxLines.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có thuốc trong toa.</p>
            ) : (
              <div className="space-y-2">
                {rxLines.map((ln, idx) => (
                  <div
                    key={`rx-${idx}`}
                    className="mb-2 grid grid-cols-1 md:grid-cols-5 gap-2 items-start"
                  >
                    <SelectMenu
                      value={ln.drugId}
                      onChange={(v) =>
                        setRxLines((arr) =>
                          arr.map((x, i) =>
                            i === idx ? { ...x, drugId: Number(v) } : x
                          )
                        )
                      }
                      options={mockDrugs.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                    />
                    <input
                      placeholder="Liều (vd: 1 viên)"
                      value={ln.dose}
                      onChange={(e) =>
                        setRxLines((arr) =>
                          arr.map((x, i) =>
                            i === idx ? { ...x, dose: e.target.value } : x
                          )
                        )
                      }
                      className="mt-1 rounded-[var(--rounded)] border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      placeholder="Tần suất (vd: 2 lần/ngày)"
                      value={ln.frequency}
                      onChange={(e) =>
                        setRxLines((arr) =>
                          arr.map((x, i) =>
                            i === idx ? { ...x, frequency: e.target.value } : x
                          )
                        )
                      }
                      className="mt-1 rounded-[var(--rounded)] border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      placeholder="Thời gian (vd: 5 ngày)"
                      value={ln.duration}
                      onChange={(e) =>
                        setRxLines((arr) =>
                          arr.map((x, i) =>
                            i === idx ? { ...x, duration: e.target.value } : x
                          )
                        )
                      }
                      className="mt-1 rounded-[var(--rounded)] border px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={() =>
                        setRxLines((arr) => arr.filter((_, i) => i !== idx))
                      }
                      className="cursor-pointer flex items-center justify-center rounded-md text-rose-600 w-14 h-14"
                      title="Xóa thuốc"
                    >
                      <Trash2 className="w-5 h-5 hover:text-rose-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Field label="Lời dặn">
              <textarea
                rows={3}
                value={rxAdvice}
                onChange={(e) => setRxAdvice(e.target.value)}
                className="w-full rounded-[var(--rounded)] border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Ngày dùng 3 lần mỗi lần 2 viên"
              />
            </Field>

            <div className="flex justify-start">
              <button
                disabled={!canSubmitRx}
                onClick={async () => {
                  await submitPrescription({
                    patientId,
                    lines: rxLines,
                    advice: rxAdvice || undefined,
                  });
                  openSuccess(
                    "Đã lưu toa thuốc",
                    "Toa thuốc đã được lưu thành công."
                  );
                  nav(-1); // quay về danh sách sau khi lưu
                }}
                className="cursor-pointer px-3 py-2 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                Lưu & Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success modal dùng chung */}
      <SuccessModal
        open={success.open}
        onClose={() => setSuccess((s) => ({ ...s, open: false }))}
        title={success.title}
        message={success.message}
        autoCloseMs={3000}
      />
    </section>
  );
}

// ===== ui nhỏ =====
function TabBtn({
  active,
  onClick,
  children,
  icon,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${
        active
          ? "bg-sky-50 border-sky-300 text-sky-500 font-semibold"
          : "hover:bg-gray-50"
      }`}
    >
      {icon} {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-1">
        <span className="block mb-1 text-sm text-slate-600">{label}</span>
        <p className="text-red-500">*</p>
      </div>
      {children}
    </label>
  );
}
