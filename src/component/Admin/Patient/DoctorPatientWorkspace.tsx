// src/features/doctor/pages/DoctorPatientWorkspace.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, FlaskConical, Pill } from "lucide-react";
import type { DiagnosisPayload, LabItem, LabOrderPayload, PrescriptionLine, PrescriptionPayload } from "../../../types/doctor/doctor";


// ====== MOCK (thay bằng API thật) ======
const mockLabItems: LabItem[] = [
  { id: 1, code: "CBC", name: "Tổng phân tích tế bào máu", sample: "blood" },
  { id: 2, code: "GLU", name: "Đường huyết", sample: "blood" },
  { id: 3, code: "UA", name: "Nước tiểu tổng quát", sample: "urine" },
];

const mockDrugs = [
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
    () => dx.symptoms.trim() && dx.diagnosis.trim(),
    [dx]
  );

  const canSubmitLab = useMemo(() => lab.items.length > 0, [lab]);

  const canSubmitRx = useMemo(
    () =>
      rxLines.length > 0 &&
      rxLines.every(
        (l) =>
          l.drugId && l.dose.trim() && l.frequency.trim() && l.duration.trim()
      ),
    [rxLines]
  );

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <h1 className="text-xl font-bold">Hồ sơ khám — BN#{patientId}</h1>
        </div>
      </div>

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
            <Field label="Triệu chứng *">
              <textarea
                value={dx.symptoms}
                onChange={(e) => setDx({ ...dx, symptoms: e.target.value })}
                rows={3}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </Field>
            <Field label="Chẩn đoán *">
              <input
                value={dx.diagnosis}
                onChange={(e) => setDx({ ...dx, diagnosis: e.target.value })}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </Field>
            <Field label="Ghi chú">
              <textarea
                value={dx.note ?? ""}
                onChange={(e) => setDx({ ...dx, note: e.target.value })}
                rows={3}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </Field>

            <div className="flex justify-start">
              <button
                disabled={!canSubmitDx}
                onClick={async () => {
                  await submitDiagnosis(dx);
                  setTab("lab");
                }}
                className="cursor-pointer px-3 py-2 rounded-md bg-primary-linear text-white"
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
                className="bg-primary-linear text-white cursor-pointer rounded-md px-3 py-1.5"
              >
                + Thêm
              </button>
            </div>

            {lab.items.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có chỉ định.</p>
            ) : (
              <div className="space-y-2">
                {lab.items.map((id, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={id}
                      onChange={(e) =>
                        setLab((l) => ({
                          ...l,
                          items: l.items.map((x, i) =>
                            i === idx ? Number(e.target.value) : x
                          ),
                        }))
                      }
                      className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {mockLabItems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() =>
                        setLab((l) => ({
                          ...l,
                          items: l.items.filter((_, i) => i !== idx),
                        }))
                      }
                      className="cursor-pointer rounded-md bg-rose-50 text-rose-700 px-2 py-1 hover:bg-rose-100 text-xs"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Field label="Ghi chú">
              <input
                value={lab.note ?? ""}
                onChange={(e) => setLab({ ...lab, note: e.target.value })}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </Field>

            <div className="flex justify-start">
              <button
                disabled={!canSubmitLab}
                onClick={async () => {
                  await submitLabOrder(lab);
                  setTab("rx");
                }}
                className="cursor-pointer px-3 py-2 rounded-md bg-primary-linear text-white disabled:opacity-60"
              >
                Lưu
              </button>
            </div>
          </div>
        )}

        {tab === "rx" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Danh mục thuốc</p>
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
                className="bg-primary-linear text-white cursor-pointer rounded-md px-3 py-1.5 "
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
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start"
                  >
                    <select
                      value={ln.drugId}
                      onChange={(e) =>
                        setRxLines((arr) =>
                          arr.map((x, i) =>
                            i === idx
                              ? { ...x, drugId: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                      className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {mockDrugs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
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
                      className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
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
                      className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
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
                      className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={() =>
                        setRxLines((arr) => arr.filter((_, i) => i !== idx))
                      }
                      className="cursor-pointer rounded-md bg-rose-50 text-rose-700 px-2 py-1 hover:bg-rose-100 text-xs"
                    >
                      Xoá
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
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
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
                  nav(-1); // quay về danh sách sau khi lưu
                }}
                className="cursor-pointer px-3 py-2 rounded-md bg-primary-linear text-white"
              >
                Lưu toa & Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>
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
        active ? "bg-sky-50 border-sky-300 text-sky-700" : "hover:bg-gray-50"
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
      <span className="block mb-1 text-sm text-slate-600">{label}</span>
      {children}
    </label>
  );
}
