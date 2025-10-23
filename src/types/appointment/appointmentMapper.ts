import type { Appointment } from "./appointment";
import type { BEAppointment } from "../../services/appointmentsApi";

export function mapBEtoFE(a: BEAppointment): Appointment {
  const hhmm = (a.visitTime || "").slice(0, 5); // "HH:mm"
  return {
    id: a.appointmentId,
    code: a.code || `BN${a.appointmentId}`,
    // patient
    patientName: a.patientName || "Không rõ tên",
    patientPhone: a.patientPhone || "-",
    // doctor & service (phẳng)
    doctorName:
      a.doctorName || (a.doctorId ? `Bác sĩ #${a.doctorId}` : "Bác sĩ"),
    serviceName: a.serviceName || undefined,
    // time
    date: a.visitDate,
    time: hhmm,
    // status/meta
    status: a.status,
    createdAt: a.createdAt,
  };
}

export function mapBEtoFEList(items: BEAppointment[]): Appointment[] {
  return items.map(mapBEtoFE);
}
