// src/components/Admin/Appointment/AppointmentCreate.tsx
import { CalendarPlus, Hash, PhoneIcon, User2, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Appointment,
  AppointmentPayload,
} from "../../../types/appointment/appointment";
import { SelectMenu } from "../../ui/select-menu";
import toast from "react-hot-toast";
import { FormField } from "../../ui/form-field";
import { Input } from "../../ui/input";
import { DateInput, TimeInput } from "./DateTimeForm";

import { apiListDoctors, type BEDoctor } from "../../../services/doctorsApi";
import {
  apiListUsersByRoleDoctor,
  type DoctorOption,
} from "../../../services/userApi";
import {
  appointmentsList,
  createAppointment,
} from "../../../services/appointmentsApi";
import { mapBEtoFE } from "../../../types/appointment/appointmentMapper";
import { getService } from "../../../services/service";
import {
  apiUpdatePatient,
  apiUpsertPatientByPhone,
} from "../../../services/patientsApi";

// ===== Helpers =====
const isValidVNPhone = (s: string) => /^0\d{9}$/.test(s.trim());
const cn = (...args: (string | false | undefined)[]) =>
  args.filter(Boolean).join(" ");

const getNowDefaults = () => {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  };
};

type GenderCode = "M" | "F";
type GenderOpt = "" | GenderCode;

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const isPastOrToday = (yyyy_mm_dd: string) => {
  const t = new Date(yyyy_mm_dd);
  if (Number.isNaN(t.getTime())) return false;
  const today = new Date();
  t.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return t <= today;
};

// Date picker helpers (same as ShiftModal)
const pad = (n: number) => n.toString().padStart(2, "0");

// ymd <-> dmy
const ymdToDmy = (ymd: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
};

const dmyToYmd = (dmy: string) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dmy)) return null;
  const [d, m, y] = dmy.split("/");
  return `${y}-${m}-${d}`;
};

// ===== Validate =====
type Errors = Partial<Record<keyof AppointmentPayload, string>>;
type Touched = Partial<Record<keyof AppointmentPayload, boolean>>;

type PatientExtraErrors = Partial<Record<string, string>>;
type PatientExtraTouched = Partial<Record<string, boolean>>;

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

  if (form.date && form.time) {
    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, minute] = form.time.split(":").map(Number);
    const scheduledAt = new Date(year, month - 1, day, hour, minute, 0);

    if (Number.isNaN(scheduledAt.getTime())) {
      err.time = "Ngày/Giờ không hợp lệ.";
    } else {
      const now = new Date();
      if (scheduledAt.getTime() < now.getTime() - 2 * 60 * 1000) {
        err.time = "Thời điểm hẹn phải ở tương lai.";
      }
    }
  }
  return err;
}

type PatientExtra = {
  gender: GenderOpt;
  dob: string;
  address: string;
  district: string;
  city: string;
  province: string;
  nationalId: string;
  email: string;
};

function validatePatientExtra(extra: PatientExtra): PatientExtraErrors {
  const err: PatientExtraErrors = {};
  
  if (!extra.gender) {
    err.gender = "Vui lòng chọn giới tính.";
  }
  
  if (!extra.dob.trim()) {
    err.dob = "Vui lòng nhập ngày sinh.";
  } else if (!isPastOrToday(extra.dob)) {
    err.dob = "Ngày sinh phải bé hơn hoặc bằng hôm nay.";
  }
  
  if (!extra.address.trim()) {
    err.address = "Vui lòng nhập địa chỉ.";
  }
  
  if (!extra.district.trim()) {
    err.district = "Vui lòng nhập phường/xã.";
  }
  
  if (!extra.city.trim()) {
    err.city = "Vui lòng nhập tỉnh/thành phố.";
  }
  
  if (!extra.nationalId.trim()) {
    err.nationalId = "Vui lòng nhập CCCD.";
  } else if (!/^\d{9}$|^\d{12}$/.test(extra.nationalId)) {
    err.nationalId = "CMND/CCCD phải gồm 9 hoặc 12 chữ số.";
  }
  
  if (!extra.email.trim()) {
    err.email = "Vui lòng nhập email.";
  } else if (!isEmail(extra.email)) {
    err.email = "Email không hợp lệ.";
  }
  
  return err;
}

interface ServiceOption {
  serviceId: number;
  name: string;
}

// ================= Component =================
export default function AppointmentCreate() {
  const { date: defaultDate, time: defaultTime } = getNowDefaults();
  const [form, setForm] = useState<AppointmentPayload>({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    serviceId: "",
    date: defaultDate,
    time: defaultTime,
    reason: "",
    source: "ONLINE",
    queueNo: undefined,
  });

  const [patientExtra, setPatientExtra] = useState<PatientExtra>({
    gender: "",
    dob: "",
    address: "",
    district: "",
    city: "",
    province: "",
    nationalId: "",
    email: "",
  });
  const [touched, setTouched] = useState<Touched>({});
  const [errors, setErrors] = useState<Errors>({});
  const [patientExtraTouched, setPatientExtraTouched] = useState<PatientExtraTouched>({});
  const [patientExtraErrors, setPatientExtraErrors] = useState<PatientExtraErrors>({});
  const [services, setServices] = useState<ServiceOption[]>([]);

  const [doctors, setDoctors] = useState<BEDoctor[]>([]);
  const [doctorUsers, setDoctorUsers] = useState<DoctorOption[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calendar state for date of birth picker
  const [dobCalOpen, setDobCalOpen] = useState(false);
  const [dobViewYear, setDobViewYear] = useState<number>(() =>
    new Date().getFullYear()
  );
  const [dobViewMonth, setDobViewMonth] = useState<number>(() =>
    new Date().getMonth()
  );

  const markTouched = <K extends keyof AppointmentPayload>(k: K) =>
    setTouched((t) => ({ ...t, [k]: true }));

  const update = <K extends keyof AppointmentPayload>(
    k: K,
    v: AppointmentPayload[K]
  ) =>
    setForm((s) => {
      const next = { ...s, [k]: v };
      setErrors(validate(next));
      return next;
    });

  const markPatientExtraTouched = (k: keyof PatientExtra) =>
    setPatientExtraTouched((t) => ({ ...t, [k]: true }));

  const updatePatientExtra = <K extends keyof PatientExtra>(
    k: K,
    v: PatientExtra[K]
  ) =>
    setPatientExtra((s) => {
      const next = { ...s, [k]: v };
      setPatientExtraErrors(validatePatientExtra(next));
      return next;
    });

  const resetForm = () => {
    const d = getNowDefaults();
    setForm({
      patientName: "",
      patientPhone: "",
      doctorId: "",
      serviceId: "",
      date: d.date,
      time: d.time,
      reason: "",
      source: "ONLINE",
      queueNo: undefined,
    });
    setPatientExtra({
      gender: "",
      dob: "",
      address: "",
      district: "",
      city: "",
      province: "",
      nationalId: "",
      email: "",
    });
    setTouched({});
    setErrors({});
    setPatientExtraTouched({});
    setPatientExtraErrors({});
  };

  // ⬇️ Load dữ liệu ban đầu - GỌI SONG SONG để tối ưu tốc độ
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      // Gọi tất cả API ĐỒNG THỜI thay vì tuần tự
      const [doctorsResult, doctorUsersResult, servicesResult] = await Promise.allSettled([
        apiListDoctors({ page: 1, limit: 200 }),
        apiListUsersByRoleDoctor({ page: 1, limit: 200, isActive: true }),
        getService({ page: 1, pageSize: 200, isActive: true })
      ]);

      // Xử lý kết quả doctors
      if (doctorsResult.status === "fulfilled") {
        setDoctors(doctorsResult.value.items ?? []);
      } else {
        console.error("❌ Error loading doctors:", doctorsResult.reason);
        toast.error("Không tải được danh sách bác sĩ");
      }

      // Xử lý kết quả doctor users
      if (doctorUsersResult.status === "fulfilled") {
        const users = doctorUsersResult.value.items ?? [];
        setDoctorUsers(users);
        if (!users.length) {
          console.warn("⚠️ Không có user role=DOCTOR. Kiểm tra roles ở BE hoặc dữ liệu mẫu.");
        }
      } else {
        console.error("❌ Error loading doctor users:", doctorUsersResult.reason);
        toast.error("Không tải được danh sách người dùng (DOCTOR)");
      }

      // Xử lý kết quả services
      if (servicesResult.status === "fulfilled") {
        setServices(
          servicesResult.value.data?.items?.map((x: ServiceOption) => ({
            serviceId: x.serviceId,
            name: x.name || `DV #${x.serviceId}`,
          })) ?? []
        );
      } else {
        console.error("❌ Error loading services:", servicesResult.reason);
        toast.error("Không tải được danh sách dịch vụ");
      }

      setLoading(false);
    };

    loadInitialData();
  }, []);

  // ⬇️ Join logic: ƯU TIÊN Doctors table (có doctorId thật), fallback về Users
  const doctorOptions = useMemo(() => {
    // ✅ Ưu tiên dùng bảng Doctors (có doctorId thật mà backend cần)
    if (doctors.length > 0) {
      return doctors
        .map((d) => ({
          value: d.doctorId,
          label: d.fullName || `BS #${d.doctorId}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "vi"));
    }

    // Fallback: dùng Users (role DOCTOR) nếu không có Doctors
    // Lưu ý: userId có thể không match với doctorId trong DB
    return doctorUsers
      .map((u) => ({
        value: u.doctorId, // Thực ra là userId
        label: u.fullName || `BS #${u.doctorId}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [doctors, doctorUsers]);

  const fetchList = useCallback(
    async (date?: string, doctorId?: number) => {
      const theDate = date || new Date().toISOString().slice(0, 10);
      try {
        const res = await appointmentsList({
          date: theDate,
          doctorId,
          page: 1,
          limit: 100,
        });

        const mapped = res.items.map(mapBEtoFE).map((it) => {
          if (!it.doctorName && doctorId) {
            const opt = doctorOptions.find((o) => o.value === Number(doctorId));
            return { ...it, doctorName: opt?.label || it.doctorName };
          }
          return it;
        });

        setAppointments(mapped);
      } catch (err) {
        console.error("❌ Error fetching appointments:", err);
        toast.error("Không tải được danh sách lịch");
      }
    },
    [doctorOptions]
  );

  useEffect(() => {
    // Chỉ fetch appointments sau khi đã load xong doctors & services
    if (!loading) {
      fetchList();
    }
  }, [fetchList, loading]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dId = typeof form.doctorId === "number" ? form.doctorId : undefined;
      if (form.date || dId) fetchList(form.date || undefined, dId);
    }, 300);
    return () => clearTimeout(timeout);
  }, [form.date, form.doctorId, fetchList]);

  // Đồng bộ tháng/năm hiển thị lịch cho ngày sinh
  useEffect(() => {
    if (!patientExtra.dob) return;
    const d =
      patientExtra.dob && /^\d{4}-\d{2}-\d{2}$/.test(patientExtra.dob)
        ? new Date(patientExtra.dob)
        : new Date();
    setDobViewYear(d.getFullYear());
    setDobViewMonth(d.getMonth());
  }, [patientExtra.dob]);

  // Calendar computed for DOB picker
  const dobMonthLabel = useMemo(
    () => `${pad(dobViewMonth + 1)}/${dobViewYear}`,
    [dobViewMonth, dobViewYear]
  );
  const dobDays = useMemo(() => {
    const first = new Date(dobViewYear, dobViewMonth, 1);
    const last = new Date(dobViewYear, dobViewMonth + 1, 0);
    const startIdx = (first.getDay() + 6) % 7;
    const total = last.getDate();
    const arr: Array<{ d: number; ymd: string }> = [];
    for (let i = 1; i <= total; i++) {
      const ymd = `${dobViewYear}-${pad(dobViewMonth + 1)}-${pad(i)}`;
      arr.push({ d: i, ymd });
    }
    return { startIdx, arr };
  }, [dobViewYear, dobViewMonth]);

  const isDobToday = (ymd: string) => {
    const now = new Date();
    const t = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
    return ymd === t;
  };
  const isDobSelected = (ymd: string) => patientExtra.dob === ymd;
  const isDobPastOrToday = (ymd: string) => {
    const t = new Date(ymd);
    if (Number.isNaN(t.getTime())) return false;
    const today = new Date();
    t.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return t <= today;
  };

  const gotoDobPrevMonth = () =>
    setDobViewMonth((m) => (m === 0 ? (setDobViewYear((y) => y - 1), 11) : m - 1));
  const gotoDobNextMonth = () =>
    setDobViewMonth((m) => (m === 11 ? (setDobViewYear((y) => y + 1), 0) : m - 1));

  const handleCreate = async () => {
    const v = validate(form);
    const vExtra = validatePatientExtra(patientExtra);
    
    setErrors(v);
    setPatientExtraErrors(vExtra);
    setTouched({
      patientName: true,
      patientPhone: true,
      doctorId: true,
      serviceId: true,
      date: true,
      time: true,
      reason: true,
    });
    setPatientExtraTouched({
      gender: true,
      dob: true,
      address: true,
      district: true,
      city: true,
      nationalId: true,
      email: true,
    });
    
    if (Object.keys(v).length > 0 || Object.keys(vExtra).length > 0) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Upsert bệnh nhân (KHÔNG gửi patientCode)
      const upsertPayload: {
        fullName: string;
        phone: string;
        gender?: "M" | "F";
        dateOfBirth?: string;
        address?: string;
        district?: string;
        city?: string;
        province?: string;
        identityNo?: string;
        email?: string;
      } = {
        fullName: form.patientName.trim(),
        phone: form.patientPhone.trim(),
      };
      if (patientExtra.gender) upsertPayload.gender = patientExtra.gender;
      if (patientExtra.dob) upsertPayload.dateOfBirth = patientExtra.dob;
      if (patientExtra.address) upsertPayload.address = patientExtra.address;
      if (patientExtra.district) upsertPayload.district = patientExtra.district;
      if (patientExtra.city) upsertPayload.city = patientExtra.city;
      if (patientExtra.province) upsertPayload.province = patientExtra.province;
      if (patientExtra.nationalId)
        upsertPayload.identityNo = patientExtra.nationalId;
      if (patientExtra.email) upsertPayload.email = patientExtra.email;

      const patientResult = await apiUpsertPatientByPhone(upsertPayload);

      // 2) Nếu là bệnh nhân mới → bổ sung mã (gửi kèm fullName & phone để khớp type PatientPayload)
      if (patientResult.isNew) {
        const newPatientCode =
          `BN${new Date().toISOString().slice(2, 10).replace(/-/g, "")}` +
          `${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

        await apiUpdatePatient(patientResult.patientId, {
          fullName: form.patientName.trim(), // ✅ bắt buộc theo type
          phone: form.patientPhone.trim(), // ✅ bắt buộc theo type
          patientCode: newPatientCode, // ✅ mã bệnh nhân mới
        });
      }

      // 3) Tạo lịch hẹn
      const patientId = patientResult.patientId;
      const timeWithSec =
        form.time.length === 5 ? `${form.time}:00` : form.time;

      const selectedDoctorId = Number(form.doctorId);

      const payload: any = {
        patientId,
        doctorId: selectedDoctorId,
        visitDate: form.date,
        visitTime: timeWithSec,
      };

      // Chỉ gửi serviceId nếu có giá trị
      if (form.serviceId) {
        payload.serviceId = Number(form.serviceId);
      }

      // Chỉ gửi reason nếu có giá trị
      if (form.reason?.trim()) {
         payload.reason = form.reason.trim();
      }

      const created = await createAppointment(payload);

      const mappedRaw = mapBEtoFE(created);
      const picked = doctorOptions.find(
        (o) => o.value === Number(form.doctorId)
      );
      const sv = services.find((s) => s.serviceId === Number(form.serviceId));

      const mapped: Appointment = {
        ...mappedRaw,
        doctorName: mappedRaw.doctorName || picked?.label || "",
        serviceName: mappedRaw.serviceName || sv?.name || undefined,
      };

      setAppointments((prev) => [mapped, ...prev]);

      toast.success(
        `Tạo lịch thành công${
          patientResult.isNew ? " (đã tạo bệnh nhân mới)" : ""
        } - Mã: ${created.code}`
      );

      resetForm();
    } catch (err: any) {
      console.error("❌ Lỗi tạo appointment:", err);
      
      // Lấy thông tin chi tiết từ response
      const responseData = err?.response?.data;
      console.error("❌ Response data:", responseData);
      
      let msg = "Không thể tạo lịch. Vui lòng thử lại.";
      
      if (responseData) {
        // Trích xuất message từ response
        msg = responseData.message || responseData.Message || msg;
        
        // Nếu có validation errors
        if (responseData.errors) {
          const errorMessages = Object.entries(responseData.errors)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(", ")}`;
            })
            .join("; ");
          msg = errorMessages || msg;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!submitting) handleCreate();
  };

  const nextQueueNo = useMemo(
    () => (appointments.length ? appointments.length + 1 : ""),
    [appointments]
  );

  const firstErrorKey = (Object.keys(errors) as (keyof Errors)[]).find(
    (k) => errors[k]
  );
  const markFirstAttr = (k: keyof AppointmentPayload) =>
    firstErrorKey === k ? { "data-first-error": "true" } : {};

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
        <header className="flex items-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5 text-sky-500" />
          <h2 className="font-bold">Tạo lịch khám bệnh</h2>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

            <FormField 
              label="Giới tính" 
              required
              error={patientExtraTouched.gender ? patientExtraErrors.gender : ""}
            >
              <SelectMenu<GenderOpt>
                value={patientExtra.gender}
                onChange={(v) => {
                  updatePatientExtra("gender", (v as GenderOpt) ?? "");
                  markPatientExtraTouched("gender");
                }}
                options={[
                  { value: "M", label: "Nam" },
                  { value: "F", label: "Nữ" },
                ]}
                invalid={!!(patientExtraTouched.gender && patientExtraErrors.gender)}
              />
            </FormField>

            <FormField 
              label="Ngày sinh" 
              required
              error={patientExtraTouched.dob ? patientExtraErrors.dob : ""}
            >
              <div className="relative">
                <div className="mt-1 flex gap-2">
                  <input
                    value={patientExtra.dob ? ymdToDmy(patientExtra.dob) : ""}
                    onChange={(e) => {
                      const ymd = dmyToYmd(e.target.value);
                      if (ymd) {
                        updatePatientExtra("dob", ymd);
                        const d = new Date(ymd);
                        setDobViewYear(d.getFullYear());
                        setDobViewMonth(d.getMonth());
                      } else if (e.target.value === "") {
                        updatePatientExtra("dob", "");
                      }
                    }}
                    onBlur={() => markPatientExtraTouched("dob")}
                    placeholder="dd/mm/yyyy"
                    className={cn(
                      "w-full rounded-[var(--rounded)] border px-3 py-3.5 shadow-xs outline-none focus:ring-2",
                      patientExtraTouched.dob && patientExtraErrors.dob
                        ? "border-red-400 focus:ring-red-300"
                        : "border-slate-200 focus:ring-sky-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setDobCalOpen((s) => !s)}
                    className="cursor-pointer px-3 rounded-[var(--rounded)] border hover:bg-gray-50 inline-flex items-center"
                    title="Chọn trên lịch"
                  >
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                  </button>
                </div>

                {dobCalOpen && (
                  <div className="absolute z-10 mt-2 w-[320px] rounded-xl border bg-white shadow-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={gotoDobPrevMonth}
                        className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
                        title="Tháng trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="font-medium">{dobMonthLabel}</div>
                      <button
                        type="button"
                        onClick={gotoDobNextMonth}
                        className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
                        title="Tháng sau"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
                      <div>T2</div>
                      <div>T3</div>
                      <div>T4</div>
                      <div>T5</div>
                      <div>T6</div>
                      <div>T7</div>
                      <div>CN</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: dobDays.startIdx }).map((_, i) => (
                        <div key={`emp-${i}`} />
                      ))}
                      {dobDays.arr.map(({ d, ymd }) => {
                        const selected = isDobSelected(ymd);
                        const today = isDobToday(ymd);
                        const pastOrToday = isDobPastOrToday(ymd);
                        return (
                          <button
                            key={ymd}
                            type="button"
                            onClick={() => {
                              if (pastOrToday) {
                                updatePatientExtra("dob", ymd);
                                setDobCalOpen(false);
                              }
                            }}
                            disabled={!pastOrToday}
                            className={cn(
                              "cursor-pointer h-9 rounded-md text-sm",
                              "hover:bg-slate-100",
                              selected && "bg-sky-500 text-white hover:bg-sky-500",
                              !selected && today && "ring-1 ring-sky-400",
                              !pastOrToday && "opacity-40 cursor-not-allowed hover:bg-transparent"
                            )}
                            title={ymdToDmy(ymd)}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </FormField>

            <FormField 
              label="Địa chỉ" 
              required
              error={patientExtraTouched.address ? patientExtraErrors.address : ""}
            >
              <Input
                value={patientExtra.address}
                onChange={(e) => updatePatientExtra("address", e.target.value)}
                onBlur={() => markPatientExtraTouched("address")}
                placeholder="Số nhà, đường…"
                invalid={!!(patientExtraTouched.address && patientExtraErrors.address)}
              />
            </FormField>

            <FormField 
              label="Phường/Xã" 
              required
              error={patientExtraTouched.district ? patientExtraErrors.district : ""}
            >
              <Input
                value={patientExtra.district}
                onChange={(e) => updatePatientExtra("district", e.target.value)}
                onBlur={() => markPatientExtraTouched("district")}
                placeholder="VD: Phường Bến Thành"
                invalid={!!(patientExtraTouched.district && patientExtraErrors.district)}
              />
            </FormField>

            <FormField 
              label="Tỉnh/Thành phố" 
              required
              error={patientExtraTouched.city ? patientExtraErrors.city : ""}
            >
              <Input
                value={patientExtra.city}
                onChange={(e) => updatePatientExtra("city", e.target.value)}
                onBlur={() => markPatientExtraTouched("city")}
                placeholder="VD: TP.HCM"
                invalid={!!(patientExtraTouched.city && patientExtraErrors.city)}
              />
            </FormField>

            <FormField 
              label="CCCD" 
              required
              error={patientExtraTouched.nationalId ? patientExtraErrors.nationalId : ""}
            >
              <Input
                value={patientExtra.nationalId}
                onChange={(e) =>
                  updatePatientExtra("nationalId", e.target.value.replace(/\D/g, "").slice(0, 12))
                }
                onBlur={() => markPatientExtraTouched("nationalId")}
                placeholder="12 số"
                inputMode="numeric"
                invalid={!!(patientExtraTouched.nationalId && patientExtraErrors.nationalId)}
              />
            </FormField>

            <FormField 
              label="Email" 
              required
              error={patientExtraTouched.email ? patientExtraErrors.email : ""}
            >
              <Input
                value={patientExtra.email}
                onChange={(e) => updatePatientExtra("email", e.target.value)}
                onBlur={() => markPatientExtraTouched("email")}
                placeholder="example@mail.com"
                type="email"
                autoComplete="email"
                invalid={!!(patientExtraTouched.email && patientExtraErrors.email)}
              />
            </FormField>

            <FormField
              label="Bác sĩ"
              required
              error={touched.doctorId ? errors.doctorId : ""}
            >
              <SelectMenu<number>
                value={
                  typeof form.doctorId === "number" ? form.doctorId : undefined
                }
                options={doctorOptions}
                onChange={(val) => {
                  update("doctorId", Number(val));
                  markTouched("doctorId");
                }}
                invalid={!!(touched.doctorId && errors.doctorId)}
              />
            </FormField>

            <FormField
              label="Dịch vụ"
              required
              error={touched.serviceId ? errors.serviceId : ""}
            >
              <SelectMenu<number>
                value={
                  typeof form.serviceId === "number" ? form.serviceId : undefined
                }
                options={services.map((s) => ({
                  value: s.serviceId,
                  label: s.name || `DV #${s.serviceId}`,
                }))}
                onChange={(val) => {
                  update("serviceId", Number(val));
                  markTouched("serviceId");
                }}
                invalid={!!(touched.serviceId && errors.serviceId)}
              />
            </FormField>

            <FormField label="Số thứ tự (tự động)" required>
              <div className="relative">
                <input
                  value={nextQueueNo || ""}
                  readOnly
                  disabled
                  placeholder="-"
                  title="Số sẽ được hệ thống cấp tự động khi tạo/check-in"
                  className="block w-full h-12 rounded-[var(--rounded)] border border-slate-200 bg-slate-50 px-4 pr-10 text-[16px] leading-6 text-slate-700 shadow-xs outline-none cursor-not-allowed"
                />
                <Hash className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </FormField>

            <FormField
              label="Ngày khám"
              required
              error={touched.date ? errors.date : ""}
            >
              <DateInput
                value={form.date}
                onChange={(d: string) => {
                  update("date", d);
                  markTouched("date");
                }}
                onBlur={() => markTouched("date")}
                invalid={!!(touched.date && errors.date)}
              />
            </FormField>
            
            <FormField
              label="Giờ khám"
              required
              error={touched.time ? errors.time : ""}
            >
              <TimeInput
                value={form.time}
                onChange={(t: string) => {
                  update("time", t);
                  markTouched("time");
                }}
                onBlur={() => markTouched("time")}
                invalid={!!(touched.time && errors.time)}
              />
            </FormField>
          </div>

          <FormField
              label="Lý do"
              required
              error={touched.reason ? errors.reason : ""}
              className="md:col-span-2"
            >
              <textarea
                {...markFirstAttr("reason")}
                value={form.reason ?? ""}
                onChange={(e) => update("reason", e.target.value.slice(0, 255))}
                onBlur={() => markTouched("reason")}
                rows={3}
                placeholder="Triệu chứng, yêu cầu đặc biệt..."
                className={cn(
                  "w-full rounded-[var(--rounded)] border px-3 py-2 text-[16px] outline-none focus:ring-2 shadow-xs",
                  touched.reason && errors.reason
                    ? "border-red-400 focus:ring-red-300"
                    : "border-slate-200 focus:ring-sky-400"
                )}
              />
            </FormField>

          <div className="mt-4 flex justify-center md:justify-start gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary-linear text-white px-4 py-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-1"></span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" />
                  Tạo lịch
                </>
              )}
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
    </div>
  );
}
