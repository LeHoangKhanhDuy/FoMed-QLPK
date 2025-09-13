import { CalendarPlus, Hash, PhoneIcon, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  Appointment,
  AppointmentPayload,
  AppointmentStatus,
} from "../../../types/appointment/appointment";
import { SelectMenu } from "../../ui/select-menu";
import toast from "react-hot-toast";
import { FormField } from "../../ui/form-field";
import { Input } from "../../ui/input";
import { DateInput, TimeInput } from "./DateTimeForm";
import AppointmentList from "./AppointmentList";

// ====== Demo data (thay bằng API thật) ======
type Doctor = { id: number; name: string; specialty: string };
type Service = { id: number; name: string };

const FAKE_DOCTORS: Doctor[] = [
  { id: 1, name: "BS. Nguyễn An", specialty: "Tim mạch" },
  { id: 2, name: "BS. Trần Bình", specialty: "Cơ xương khớp" },
];
const FAKE_SERVICES: Service[] = [
  { id: 1, name: "Khám tổng quát" },
  { id: 2, name: "Khám tim mạch" },
];

let seedId = 1032;

// ====== Helpers ======
const isValidVNPhone = (s: string) => /^0\d{9}$/.test(s.trim());
const cn = (...args: (string | false | undefined)[]) =>
  args.filter(Boolean).join(" ");

// ====== Validate rules ======
type Errors = Partial<Record<keyof AppointmentPayload, string>>;
type Touched = Partial<Record<keyof AppointmentPayload, boolean>>;

function validate(form: AppointmentPayload): Errors {
  const err: Errors = {};

  if (!form.patientName.trim())
    err.patientName = "Vui lòng nhập tên bệnh nhân.";
  if (!form.patientPhone.trim())
    err.patientPhone = "Vui lòng nhập số điện thoại.";
  else if (!isValidVNPhone(form.patientPhone))
    err.patientPhone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";

  if (!form.doctorId) err.doctorId = "Vui lòng chọn bác sĩ.";
  if (!form.serviceId) err.serviceId = "Vui lòng chọn dịch vụ.";

  if (!form.date) err.date = "Vui lòng chọn ngày.";
  if (!form.time) err.time = "Vui lòng chọn giờ.";

  if (!form.reason?.trim()) err.reason = "Vui lòng nhập lý do.";
  else if (form.reason.length > 255) err.reason = "Lý do tối đa 255 ký tự.";

  // Ngày/Giờ phải ở tương lai
  if (form.date && form.time) {
    const scheduledAt = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(scheduledAt.getTime()))
      err.time = "Ngày/Giờ không hợp lệ.";
    else if (scheduledAt.getTime() < Date.now())
      err.time = "Thời điểm hẹn phải ở tương lai.";
  }

  return err;
}

export default function AppointmentCreate() {
  // Form state
  const [form, setForm] = useState<AppointmentPayload>({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    serviceId: "",
    date: "",
    time: "",
    reason: "",
    source: "ONLINE",
    queueNo: undefined,
  });

  // touched & errors
  const [touched, setTouched] = useState<Touched>({});
  const [errors, setErrors] = useState<Errors>({});

  const markTouched = <K extends keyof AppointmentPayload>(k: K) =>
    setTouched((t) => ({ ...t, [k]: true }));

  const update = <K extends keyof AppointmentPayload>(
    k: K,
    v: AppointmentPayload[K]
  ) => {
    setForm((s) => {
      const next = { ...s, [k]: v };
      // live-validate từng field
      setErrors(validate(next));
      return next;
    });
  };

  const resetForm = () => {
    setForm({
      patientName: "",
      patientPhone: "",
      doctorId: "",
      serviceId: "",
      date: "",
      time: "",
      reason: "",
      source: "ONLINE",
      queueNo: undefined,
    });
    setTouched({});
    setErrors({});
  };

  // Mock initial
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initial: Appointment[] = [
      {
        id: 1001,
        code: "AP-2025001",
        patientName: "Nguyễn Văn A",
        patientPhone: "0901234567",
        doctorName: "BS. Nguyễn An",
        serviceName: "Khám tổng quát",
        date: "2025-09-10",
        time: "09:00",
        status: "waiting",
        createdAt: new Date().toISOString(),
      },
      {
        id: 1002,
        code: "AP-2025002",
        patientName: "Trần Thị B",
        patientPhone: "0912345678",
        doctorName: "BS. Trần Bình",
        serviceName: "Khám tim mạch",
        date: "2025-09-12",
        time: "14:30",
        status: "booked",
        createdAt: new Date().toISOString(),
      },
    ];
    setAppointments(initial);
  }, []);

  const handleCreate = async () => {
    const v = validate(form);
    setErrors(v);
    // mark tất cả field là touched để show lỗi
    setTouched({
      patientName: true,
      patientPhone: true,
      doctorId: true,
      serviceId: true,
      date: true,
      time: true,
      reason: true,
    });

    if (Object.keys(v).length > 0) {
      // scroll đến field đầu có lỗi (nếu cần)
      const first = document.querySelector(
        "[data-first-error='true']"
      ) as HTMLElement | null;
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const doctor = FAKE_DOCTORS.find((d) => d.id === form.doctorId)!;
      const service = FAKE_SERVICES.find((s) => s.id === form.serviceId)!;
      const initialStatus: AppointmentStatus =
        form.source === "ONLINE" ? "booked" : "waiting";

      const newAppt: Appointment = {
        id: ++seedId,
        code: `AP-${seedId}`,
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        doctorName: doctor.name,
        serviceName: service?.name,
        date: form.date,
        time: form.time,
        status: initialStatus,
        createdAt: new Date().toISOString(),
      };

      setAppointments((lst) => [newAppt, ...lst]);
      resetForm();
      toast.success("Tạo lịch thành công!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (submitting) return; // chặn double-submit
    handleCreate();
  };

  const setStatus = (id: number, status: AppointmentStatus) =>
    setAppointments((lst) =>
      lst.map((it) => (it.id === id ? { ...it, status } : it))
    );

  const nextQueueNo = useMemo(() => {
    if (!form.date) return "";
    const sameDay = appointments.filter((a) => a.date === form.date);
    return sameDay.length + 1; // preview
  }, [appointments, form.date]);

  // helper đánh dấu field đầu có lỗi để scroll
  const firstErrorKey = (Object.keys(errors) as (keyof Errors)[]).find(
    (k) => errors[k]
  );
  const markFirstAttr = (k: keyof AppointmentPayload) =>
    firstErrorKey === k ? { "data-first-error": "true" } : {};

  return (
    <div className="space-y-6">
      {/* Form tạo lịch */}
      <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
        <header className="flex items-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5 text-sky-500" />
          <h2 className="font-bold">Tạo lịch khám bệnh</h2>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên bệnh nhân */}
            <FormField
              label="Tên bệnh nhân"
              required
              error={touched.patientName ? errors.patientName : ""}
            >
              <Input
                value={form.patientName}
                onChange={(e) => update("patientName", e.target.value)}
                onBlur={() => markTouched("patientName")}
                placeholder="VD: Nguyễn Văn A"
                leftIcon={<User2 className="h-5 w-5" />}
                invalid={!!(touched.patientName && errors.patientName)}
                autoComplete="name"
                enterKeyHint="next"
              />
            </FormField>

            {/* Số điện thoại */}
            <FormField
              label="Số điện thoại"
              required
              error={touched.patientPhone ? errors.patientPhone : ""}
            >
              <Input
                value={form.patientPhone}
                onChange={(e) =>
                  update("patientPhone", e.target.value.replace(/\D/g, ""))
                }
                onBlur={() => markTouched("patientPhone")}
                placeholder="VD: 0123456789"
                leftIcon={<PhoneIcon className="h-5 w-5" />}
                invalid={!!(touched.patientPhone && errors.patientPhone)}
                inputMode="numeric"
                autoComplete="tel"
                enterKeyHint="next"
              />
            </FormField>

            {/* Bác sĩ */}
            <SelectMenu
              label="Bác sĩ"
              required
              value={form.doctorId}
              options={FAKE_DOCTORS.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.specialty})`,
              }))}
              onChange={(v) => {
                update("doctorId", v as number | "");
                setTouched((t) => ({ ...t, doctorId: true }));
              }}
              invalid={!!(touched.doctorId && errors.doctorId)}
              error={touched.doctorId ? errors.doctorId : ""}
            />

            {/* Dịch vụ */}
            <SelectMenu
              label="Dịch vụ"
              required
              value={form.serviceId}
              options={FAKE_SERVICES.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              onChange={(v) => {
                update("serviceId", v as number | "");
                setTouched((t) => ({ ...t, serviceId: true }));
              }}
              invalid={!!(touched.serviceId && errors.serviceId)}
              error={touched.serviceId ? errors.serviceId : ""}
            />

            {/* Số thứ tự (preview, không sửa) */}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">
                Số thứ tự (tự động)
              </label>
              <div className="relative">
                <input
                  value={nextQueueNo || ""}
                  readOnly
                  disabled
                  placeholder="-"
                  title="Số sẽ được hệ thống cấp tự động khi tạo/check-in"
                  className="mt-1 block w-full h-12 rounded-[var(--rounded)] border border-slate-200 bg-slate-50 px-4 pr-10 text-[16px] leading-6 text-slate-700 shadow-xs outline-none cursor-not-allowed"
                />
                <Hash className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Ngày & Giờ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Ngày khám">
                <DateInput />
              </FormField>
              <FormField label="Giờ khám">
                <TimeInput />
              </FormField>
            </div>

            {/* Lý do */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-sm text-slate-600">Lý do</label>
                <p className="text-red-500">*</p>
              </div>
              <textarea
                {...markFirstAttr("reason")}
                value={form.reason ?? ""}
                onChange={(e) => update("reason", e.target.value.slice(0, 255))}
                onBlur={() => markTouched("reason")}
                rows={3}
                placeholder="Triệu chứng, yêu cầu đặc biệt..."
                className={cn(
                  "mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2",
                  touched.reason && errors.reason
                    ? "border-red-400 focus:ring-red-300"
                    : "border-slate-200 focus:ring-sky-400"
                )}
              />
              {touched.reason && errors.reason && (
                <p className="text-xs text-red-500">{errors.reason}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-center md:justify-start gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary-linear text-white px-4 py-2 disabled:opacity-60"
            >
              <CalendarPlus className="w-4 h-4" />
              Tạo lịch
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Xoá nhập
            </button>
          </div>
        </form>
      </section>

      {/* Danh sách lịch chờ khám */}
      <AppointmentList
        items={appointments}
        onSetStatus={setStatus}
        onView={(id) => alert(`Xem chi tiết #${id}`)}
      />
    </div>
  );
}
