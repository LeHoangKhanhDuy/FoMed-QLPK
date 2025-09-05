import {
  CalendarPlus,
  PhoneIcon,
  User2,
  Building2,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";

import type {
  Appointment,
  AppointmentPayload,
  AppointmentStatus,
} from "../../../types/appointment";
import AppointmentList from "./AppointmentList";

/** ====== Demo data (thay bằng API thật) ====== */
type Doctor = { id: number; name: string; specialty: string };
type Service = { id: number; name: string };
type Clinic = { id: number; name: string; address: string };

const FAKE_DOCTORS: Doctor[] = [
  { id: 1, name: "BS. Nguyễn An", specialty: "Tim mạch" },
  { id: 2, name: "BS. Trần Bình", specialty: "Cơ xương khớp" },
];
const FAKE_SERVICES: Service[] = [
  { id: 1, name: "Khám tổng quát" },
  { id: 2, name: "Khám tim mạch" },
];
const FAKE_CLINICS: Clinic[] = [
  { id: 1, name: "FoMed Clinic 1", address: "123 Võ Văn Tần, Q3" },
  { id: 2, name: "FoMed Clinic 2", address: "456 Lê Lợi, Q1" },
];

let seedId = 1032;

/** ====== Helpers ====== */
const isValidVNPhone = (s: string) => /^0\d{9}$/.test(s.trim());

export default function AppointmentCreate() {
  // Form state
  const [form, setForm] = useState<AppointmentPayload>({
    patientName: "",
    patientPhone: "",
    clinicId: "",
    doctorId: "",
    serviceId: "",
    date: "",
    time: "",
    note: "",
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Mock initial
  useEffect(() => {
    const initial: Appointment[] = [
      {
        id: 1001,
        code: "AP-2025001",
        patientName: "Nguyễn Văn A",
        patientPhone: "0901234567",
        clinicName: "FoMed Clinic 1",
        doctorName: "BS. Nguyễn An",
        serviceName: "Khám tổng quát",
        date: "2025-09-10",
        time: "09:00",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: 1002,
        code: "AP-2025002",
        patientName: "Trần Thị B",
        patientPhone: "0912345678",
        clinicName: "FoMed Clinic 2",
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

  /** ====== Handlers ====== */
  const update = <K extends keyof AppointmentPayload>(
    k: K,
    v: AppointmentPayload[K]
  ) => setForm((s) => ({ ...s, [k]: v }));

  const resetForm = () =>
    setForm({
      patientName: "",
      patientPhone: "",
      clinicId: "",
      doctorId: "",
      serviceId: "",
      date: "",
      time: "",
      note: "",
    });

  const handleCreate = async () => {
    if (!form.patientName.trim()) return alert("Vui lòng nhập tên bệnh nhân");
    if (!isValidVNPhone(form.patientPhone))
      return alert("SĐT không hợp lệ (10 số, bắt đầu bằng 0)");
    if (!form.clinicId) return alert("Vui lòng chọn phòng khám");
    if (!form.doctorId) return alert("Vui lòng chọn bác sĩ");
    if (!form.serviceId) return alert("Vui lòng chọn dịch vụ");
    if (!form.date) return alert("Vui lòng chọn ngày");
    if (!form.time) return alert("Vui lòng chọn giờ");

    setSubmitting(true);
    try {
      const clinic = FAKE_CLINICS.find((c) => c.id === form.clinicId)!;
      const doctor = FAKE_DOCTORS.find((d) => d.id === form.doctorId)!;
      const service = FAKE_SERVICES.find((s) => s.id === form.serviceId)!;

      const newAppt: Appointment = {
        id: ++seedId,
        code: `AP-${seedId}`,
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        clinicName: clinic.name,
        doctorName: doctor.name,
        serviceName: service.name,
        date: form.date,
        time: form.time,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setAppointments((lst) => [newAppt, ...lst]);
      resetForm();
      alert("Tạo lịch thành công!");
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = (id: number, status: AppointmentStatus) =>
    setAppointments((lst) =>
      lst.map((it) => (it.id === id ? { ...it, status } : it))
    );

  /** ====== UI ====== */
  return (
    <div className="space-y-6">
      {/* Form tạo lịch: giữ format giao diện của bạn */}
      <section className="bg-white rounded-xl shadow-xs border p-4 sm:p-6">
        <header className="flex items-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5 text-sky-500" />
          <h2 className="font-bold">Tạo lịch khám bệnh</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên bệnh nhân */}
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Tên bệnh nhân</label>
            <div className="relative">
              <input
                value={form.patientName}
                onChange={(e) => update("patientName", e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              />
              <User2 className="w-4 h-4 text-slate-400 absolute right-3 top-5" />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Số điện thoại</label>
            <div className="relative">
              <input
                value={form.patientPhone}
                onChange={(e) =>
                  update("patientPhone", e.target.value.replace(/\D/g, ""))
                }
                placeholder="VD: 0123456789"
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              />
              <PhoneIcon className="w-4 h-4 text-slate-400 absolute right-3 top-5" />
            </div>
          </div>

          {/* Phòng khám */}
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Phòng khám</label>
            <div className="relative">
              <select
                value={form.clinicId}
                onChange={(e) => update("clinicId", Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                <option value="">-- Chọn phòng khám --</option>
                {FAKE_CLINICS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.address}
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-5" />
            </div>
          </div>

          {/* Bác sĩ */}
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Bác sĩ</label>
            <div className="relative">
              <select
                value={form.doctorId}
                onChange={(e) => update("doctorId", Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                <option value="">-- Chọn bác sĩ --</option>
                {FAKE_DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
              <Stethoscope className="w-4 h-4 text-slate-400 absolute right-3 top-5" />
            </div>
          </div>

          {/* Dịch vụ */}
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Dịch vụ</label>
            <select
              value={form.serviceId}
              onChange={(e) => update("serviceId", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            >
              <option value="">-- Chọn dịch vụ --</option>
              {FAKE_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày & Giờ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Ngày</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Giờ</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-slate-600">Ghi chú</label>
            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              rows={3}
              placeholder="Triệu chứng, yêu cầu đặc biệt..."
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary-linear hover:bg-sky-700 text-white px-4 py-2 disabled:opacity-60"
          >
            <CalendarPlus className="w-4 h-4" />
            Tạo lịch
          </button>
          <button
            onClick={resetForm}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Xoá nhập
          </button>
        </div>
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
