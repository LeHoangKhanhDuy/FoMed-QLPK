// src/services/doctorWorkspaceApi.ts
import { authHttp } from "./http";
import { getErrorMessage } from "../Utils/errorHepler";
import type {
  DiagnosisPayload,
  LabOrderPayload,
  PrescriptionPayload,
  WorkspaceCatalogs,
  StartEncounterPayload,
  CompleteEncounterPayload,
  LabItem,
} from "../types/doctor/doctor";

const PREFIX = "/api/doctor-workspace";

/** Lấy danh mục xét nghiệm */
export async function apiGetLabTests(): Promise<LabItem[]> {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message: string;
      data: any;
    }>(`${PREFIX}/lab-tests`);
    // Backend may return different shapes. Normalize to LabItem[] when possible.
    const d = data.data;
    if (Array.isArray(d)) return d as LabItem[];
    if (!d) return [];
    if (Array.isArray(d.labTests)) return d.labTests as LabItem[];
    if (Array.isArray(d.items)) return d.items as LabItem[];
    // If data is an object with numeric keys or wrapped structure, try to extract arrays
    const maybeArray = Object.values(d).find((v) => Array.isArray(v));
    if (Array.isArray(maybeArray)) return maybeArray as LabItem[];
    return [];
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không tải được danh mục xét nghiệm"));
  }
}

/** Lấy danh mục thuốc */
export async function apiGetMedicines(): Promise<
  Array<{
    id: number;
    name: string;
    unit?: string;
    isActive: boolean;
    stock: number;
  }>
> {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message: string;
      data: Array<{
        medicineId: number;
        name: string;
        unit?: string;
        isActive: boolean;
        stock: number;
      }>;
    }>(`${PREFIX}/medicines`);

    return (data.data || []).map((med) => ({
      id: med.medicineId,
      name: med.name,
      unit: med.unit ?? "",
      isActive: med.isActive,
      stock: med.stock ?? 0,
    }));
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không tải được danh mục thuốc"));
  }
}

/** Gom chung danh mục lab + thuốc để FE dùng tiện hơn */
export async function apiGetWorkspaceCatalogs(): Promise<WorkspaceCatalogs> {
  try {
    const [labTests, medicines] = await Promise.all([
      apiGetLabTests(),
      apiGetMedicines(),
    ]);
    return { labTests, medicines };
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không tải được danh mục"));
  }
}

/** Bắt đầu khám */
export async function apiStartEncounter(payload: StartEncounterPayload) {
  try {
    const { data } = await authHttp.post<{
      success: boolean;
      message: string;
      data: { encounterId: number };
    }>(`${PREFIX}/encounters/start`, payload);
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể bắt đầu phiên khám"));
  }
}

/** Lưu chẩn đoán */
export async function apiSubmitDiagnosis(payload: DiagnosisPayload) {
  try {
    const transformedPayload = {
      AppointmentId: payload.appointmentId,
      Symptoms: payload.symptoms,
      Diagnosis: payload.diagnosis,
      Note: payload.note,
    };
    await authHttp.post(`${PREFIX}/encounters/diagnosis`, transformedPayload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lưu chẩn đoán"));
  }
}

/** Lưu chỉ định xét nghiệm */
export async function apiSubmitLabOrder(payload: LabOrderPayload) {
  try {
    const transformedPayload: any = {
      AppointmentId: payload.appointmentId,
      TestIds: payload.items, // ← Backend expects TestIds
      Note: payload.note,
      Priority: payload.priority,
    };

    // If frontend provides full test details, attach them as well.
    if (
      payload.tests &&
      Array.isArray(payload.tests) &&
      payload.tests.length > 0
    ) {
      transformedPayload.Tests = payload.tests.map((t) => ({
        Id: t.id,
        Code: t.code,
        Name: t.name,
        Note: t.note?.trim() || null,
      }));
    }
    await authHttp.post(`${PREFIX}/encounters/lab-orders`, transformedPayload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lưu chỉ định xét nghiệm"));
  }
}

/** Lưu toa thuốc */
export async function apiSubmitPrescription(payload: PrescriptionPayload) {
  try {
    // Validate payload
    if (!payload.appointmentId) throw new Error("AppointmentId is required");
    if (!payload.lines || payload.lines.length === 0)
      throw new Error("At least one prescription line is required");

    payload.lines.forEach((line, i) => {
      if (!line.drugId) throw new Error(`Dòng ${i + 1}: Chưa chọn thuốc`);
      if (!line.dose?.trim())
        throw new Error(`Dòng ${i + 1}: Chưa nhập liều dùng`);
      if (!line.frequency?.trim())
        throw new Error(`Dòng ${i + 1}: Chưa nhập tần suất`);
      if (!line.duration?.trim())
        throw new Error(`Dòng ${i + 1}: Chưa nhập thời gian`);
    });

    const transformedPayload = {
      AppointmentId: payload.appointmentId,
      Lines: payload.lines.map((line) => ({
        MedicineId: line.drugId,
        Dose: line.dose.trim(),
        Frequency: line.frequency.trim(),
        Duration: line.duration.trim(),
        Note: line.note?.trim() || null,
      })),
      Advice: payload.advice?.trim() || null,
    };

    // Tạo encounter nếu chưa có
    try {
      const encounterPayload = {
        AppointmentId: payload.appointmentId,
        Symptoms: "Khám bệnh",
        Diagnosis: "Chẩn đoán ban đầu",
        Note: "Tự động tạo để kê toa",
      };
      await authHttp.post(`${PREFIX}/encounters/diagnosis`, encounterPayload);
    } catch {
      // Ignore: có thể đã tồn tại
    }

    const response = await authHttp.post(
      `${PREFIX}/encounters/prescriptions`,
      transformedPayload
    );
    return response.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lưu toa thuốc"));
  }
}

/** Hoàn tất khám */
export async function apiCompleteEncounter(payload: CompleteEncounterPayload) {
  try {
    await authHttp.post(`${PREFIX}/encounters/complete`, payload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể hoàn tất phiên khám"));
  }
}
