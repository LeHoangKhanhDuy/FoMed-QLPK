import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Stethoscope,
  FlaskConical,
  Pill,
  Trash2,
} from "lucide-react";
import type {
  DiagnosisPayload,
  LabItem,
  LabOrderPayload,
  PrescriptionLine,
  PrescriptionPayload,
  WorkspaceCatalogs,
} from "../../../types/doctor/doctor";
import SuccessModal from "../../../common/SuccessModal";
import { SelectMenu } from "../../ui/select-menu";
import toast from "react-hot-toast";
import {
  apiGetWorkspaceCatalogs,
  apiStartEncounter,
  apiSubmitDiagnosis,
  apiSubmitLabOrder,
  apiSubmitPrescription,
  apiCompleteEncounter,
} from "../../../services/doctorWorkspaceApi";

type TabKey = "dx" | "lab" | "rx";

export default function DoctorPatientWorkspace() {
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const appointmentId = Number(sp.get("appointmentId") || 0);
  const patientId = Number(sp.get("patientId") || 0);

  const [success, setSuccess] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  const [tab, setTab] = useState<TabKey>("dx");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [labTests, setLabTests] = useState<LabItem[]>([]);
  const [medicines, setMedicines] = useState<
    Array<{ id: number; name: string; unit?: string | null }>
  >([]);

  const [dx, setDx] = useState<DiagnosisPayload>({
    appointmentId,
    patientId,
    symptoms: "",
    diagnosis: "",
    note: "",
  });

  const [lab, setLab] = useState<LabOrderPayload>({
    appointmentId,
    patientId,
    items: [],
    note: "",
    priority: "normal",
  });

  const [rxLines, setRxLines] = useState<PrescriptionLine[]>([]);
  const [rxAdvice, setRxAdvice] = useState("");

  const canSubmitDx = useMemo(
    () =>
      dx.symptoms.trim().length > 0 &&
      dx.diagnosis.trim().length > 0 &&
      appointmentId > 0 &&
      patientId > 0,
    [dx, appointmentId, patientId]
  );

  const canSubmitLab = useMemo(
    () =>
      // ✅ Cho phép submit nếu có ít nhất 1 xét nghiệm HOẶC có ghi chú
      (lab.items.length > 0 || (lab.note && lab.note.trim().length > 0)) &&
      appointmentId > 0 &&
      patientId > 0,
    [lab.items.length, lab.note, appointmentId, patientId]
  );

  const canSubmitRx = useMemo(
    () =>
      rxLines.length > 0 &&
      rxLines.every(
        (l) =>
          !!l.drugId &&
          !!l.dose.trim() &&
          !!l.frequency.trim() &&
          !!l.duration.trim()
      ) &&
      appointmentId > 0 &&
      patientId > 0,
    [rxLines, appointmentId, patientId]
  );

  useEffect(() => {
    const boot = async () => {
      if (!appointmentId || !patientId) {
        toast.error("Thiếu thông tin lịch khám hoặc bệnh nhân.");
        nav(-1);
        return;
      }
      try {
        setLoading(true);
        await apiStartEncounter({ appointmentId });
        const cat: WorkspaceCatalogs = await apiGetWorkspaceCatalogs();
        setLabTests(cat.labTests || []);
        setMedicines(cat.medicines || []);
      } catch (e: any) {
        toast.error(e?.message || "Không thể mở hồ sơ khám");
        nav(-1);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [appointmentId, patientId, nav]);

  const openSuccess = (title: string, message: string) =>
    setSuccess({ open: true, title, message });

  const handleSaveDx = async () => {
    if (!canSubmitDx) {
      toast.error(
        !dx.symptoms.trim()
          ? "Vui lòng nhập Triệu chứng."
          : !dx.diagnosis.trim()
          ? "Vui lòng nhập Chẩn đoán."
          : "Thiếu thông tin lịch khám/bệnh nhân."
      );
      return;
    }
    try {
      setSubmitting(true);
      await apiSubmitDiagnosis(dx);
      openSuccess("Đã lưu chẩn đoán", "Chẩn đoán đã được lưu thành công.");
      setTab("lab");
    } catch (e: any) {
      toast.error(e?.message || "Không thể lưu chẩn đoán");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveLab = async () => {
    if (!canSubmitLab) {
      toast.error(
        lab.items.length === 0 && (!lab.note || !lab.note.trim())
          ? "Vui lòng chọn ít nhất 1 xét nghiệm HOẶC ghi chú lý do không xét nghiệm."
          : "Thiếu thông tin lịch khám/bệnh nhân."
      );
      return;
    }
    try {
      setSubmitting(true);
      await apiSubmitLabOrder(lab);
      openSuccess(
        lab.items.length > 0 ? "Đã lưu chỉ định" : "Đã lưu ghi chú",
        lab.items.length > 0
          ? "Chỉ định xét nghiệm đã được lưu."
          : "Đã ghi nhận không có xét nghiệm."
      );
      setTab("rx");
    } catch (e: any) {
      toast.error(e?.message || "Không thể lưu chỉ định xét nghiệm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRx = async () => {
    if (!canSubmitRx) {
      const invalid = rxLines.findIndex(
        (l) =>
          !l.drugId ||
          !l.dose.trim() ||
          !l.frequency.trim() ||
          !l.duration.trim()
      );
      toast.error(
        rxLines.length === 0
          ? "Vui lòng thêm ít nhất 1 thuốc."
          : invalid >= 0
          ? `Dòng thuốc #${
              invalid + 1
            } chưa đủ thông tin (Liều/Tần suất/Thời gian).`
          : "Thiếu thông tin lịch khám/bệnh nhân."
      );
      return;
    }
    try {
      setSubmitting(true);
      const payload: PrescriptionPayload = {
        appointmentId,
        patientId,
        lines: rxLines,
        advice: rxAdvice || undefined,
      };
      await apiSubmitPrescription(payload);
      await apiCompleteEncounter({ appointmentId });
      openSuccess(
        "Đã lưu toa thuốc",
        "Toa thuốc đã được lưu. Phiên khám đã hoàn tất."
      );
      setTimeout(() => nav(-1), 1500);
    } catch (e: any) {
      toast.error(e?.message || "Không thể lưu toa thuốc/hoàn tất");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="p-6 bg-white rounded-xl border shadow-xs">
        <p className="text-slate-600">Đang mở hồ sơ khám…</p>
      </section>
    );
  }

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
          <h1 className="text-xl font-bold">
            Hồ sơ khám bệnh — Mã hồ sơ #{patientId}
          </h1>
        </div>
      </header>

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

        {tab === "dx" && (
          <div className="space-y-3">
            <Field label="Triệu chứng">
              <textarea
                value={dx.symptoms}
                onChange={(e) => setDx({ ...dx, symptoms: e.target.value })}
                rows={3}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Sốt, đau đầu,…"
              />
            </Field>
            <Field label="Chẩn đoán">
              <input
                value={dx.diagnosis}
                onChange={(e) => setDx({ ...dx, diagnosis: e.target.value })}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="VD: Cảm lạnh,…"
              />
            </Field>
            <Field label="Ghi chú" optional>
              <textarea
                value={dx.note ?? ""}
                onChange={(e) => setDx({ ...dx, note: e.target.value })}
                rows={3}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ghi chú thêm (không bắt buộc)"
              />
            </Field>

            <div className="flex justify-start">
              <button
                disabled={!canSubmitDx || submitting}
                onClick={handleSaveDx}
                className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                {submitting ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </div>
        )}

        {tab === "lab" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Danh mục xét nghiệm</p>
              <button
                onClick={() => {
                  if (labTests.length === 0) {
                    toast.error("Không có xét nghiệm nào để chọn");
                    return;
                  }
                  setLab((l) => ({
                    ...l,
                    items: [...l.items, labTests[0].id],
                  }));
                }}
                disabled={labTests.length === 0}
                className="cursor-pointer px-3 py-1.5 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                + Thêm
              </button>
            </div>

            {lab.items.length === 0 ? (
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-md">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">💡 Lưu ý:</span> Nếu không cần
                  xét nghiệm, vui lòng ghi rõ lý do ở phần Ghi chú bên dưới.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lab.items.map((labId, idx) => (
                  <div
                    key={`${labId}-${idx}`}
                    className="flex gap-2 items-center"
                  >
                    <div className="flex-1">
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
                        options={labTests.map((s) => ({
                          value: s.id,
                          label: `${s.code} — ${s.name}`,
                        }))}
                      />
                    </div>
                    <button
                      onClick={() =>
                        setLab((l) => ({
                          ...l,
                          items: l.items.filter((_, i) => i !== idx),
                        }))
                      }
                      className="cursor-pointer rounded-md text-rose-600 px-2 py-1 hover:bg-rose-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Field
              label={
                lab.items.length === 0
                  ? "Ghi chú (Lý do không xét nghiệm)"
                  : "Ghi chú"
              }
              optional={lab.items.length > 0}
            >
              <textarea
                value={lab.note ?? ""}
                onChange={(e) => setLab({ ...lab, note: e.target.value })}
                rows={3}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder={
                  lab.items.length === 0
                    ? "VD: Bệnh nhân không có triệu chứng cần xét nghiệm"
                    : "Ghi chú thêm (không bắt buộc)"
                }
              />
            </Field>

            <div className="flex justify-start gap-2">
              <button
                onClick={() => setTab("dx")}
                className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                disabled={!canSubmitLab || submitting}
                onClick={handleSaveLab}
                className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                {submitting ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </div>
        )}

        {tab === "rx" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Danh mục thuốc</p>
              <button
                onClick={() => {
                  if (medicines.length === 0) {
                    toast.error("Không có thuốc nào để chọn");
                    return;
                  }
                  setRxLines((ls) => [
                    ...ls,
                    {
                      drugId: medicines[0].id,
                      dose: "",
                      frequency: "",
                      duration: "",
                    },
                  ]);
                }}
                disabled={medicines.length === 0}
                className="cursor-pointer px-3 py-1.5 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                + Thêm thuốc
              </button>
            </div>

            {rxLines.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có thuốc trong toa.</p>
            ) : (
              <div className="space-y-3">
                {rxLines.map((ln, idx) => (
                  <div
                    key={`rx-${idx}`}
                    className="p-3 border rounded-md bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {medicines.length === 0 ? (
                        <p className="text-red-500 col-span-full">
                          Không có thuốc nào để chọn.
                        </p>
                      ) : (
                        <div className="md:col-span-2 lg:col-span-4">
                          <label className="block text-sm font-medium mb-1">
                            Tên thuốc <span className="text-red-500">*</span>
                          </label>
                          <SelectMenu
                            value={ln.drugId}
                            onChange={(v) => {
                              setRxLines((arr) =>
                                arr.map((x, i) =>
                                  i === idx ? { ...x, drugId: Number(v) } : x
                                )
                              );
                            }}
                            options={medicines.map((d) => ({
                              value: d.id,
                              label: `${d.name}${d.unit ? ` (${d.unit})` : ""}`,
                            }))}
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Liều dùng <span className="text-red-500">*</span>
                        </label>
                        <input
                          placeholder="VD: 1 viên"
                          value={ln.dose}
                          onChange={(e) =>
                            setRxLines((arr) =>
                              arr.map((x, i) =>
                                i === idx ? { ...x, dose: e.target.value } : x
                              )
                            )
                          }
                          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tần suất <span className="text-red-500">*</span>
                        </label>
                        <input
                          placeholder="VD: 2 lần/ngày"
                          value={ln.frequency}
                          onChange={(e) =>
                            setRxLines((arr) =>
                              arr.map((x, i) =>
                                i === idx
                                  ? { ...x, frequency: e.target.value }
                                  : x
                              )
                            )
                          }
                          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Thời gian <span className="text-red-500">*</span>
                        </label>
                        <input
                          placeholder="VD: 5 ngày"
                          value={ln.duration}
                          onChange={(e) =>
                            setRxLines((arr) =>
                              arr.map((x, i) =>
                                i === idx
                                  ? { ...x, duration: e.target.value }
                                  : x
                              )
                            )
                          }
                          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() =>
                            setRxLines((arr) => arr.filter((_, i) => i !== idx))
                          }
                          className="cursor-pointer w-full rounded-md text-rose-600 px-3 py-2 border border-rose-300 hover:bg-rose-50 flex items-center justify-center gap-2"
                          title="Xóa thuốc"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Field label="Lời dặn" optional>
              <textarea
                rows={3}
                value={rxAdvice}
                onChange={(e) => setRxAdvice(e.target.value)}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Lời dặn cho bệnh nhân (không bắt buộc)"
              />
            </Field>

            <div className="flex justify-start gap-2">
              <button
                onClick={() => setTab("lab")}
                className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                disabled={!canSubmitRx || submitting}
                onClick={handleSaveRx}
                className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] bg-primary-linear text-white"
              >
                {submitting ? "Đang lưu…" : "Hoàn tất"}
              </button>
            </div>
          </div>
        )}
      </div>

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
      className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
        active
          ? "bg-sky-50 border-sky-300 text-sky-600 font-semibold"
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
  optional = false,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {!optional && <span className="text-red-500">*</span>}
      </div>
      {children}
    </label>
  );
}
