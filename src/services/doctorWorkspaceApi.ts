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
      data: LabItem[];
    }>(`${PREFIX}/lab-tests`);
    return data.data || [];
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không tải được danh mục xét nghiệm"));
  }
}

/** Lấy danh mục thuốc */
export async function apiGetMedicines(): Promise<
  Array<{ id: number; name: string; unit?: string | null }>
> {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message: string;
      data: Array<{
        medicineId: number;
        name: string;
        unit?: string | null;
      }>;
    }>(`${PREFIX}/medicines`);

    // Transform medicineId to id for consistency
    return (data.data || []).map((med) => ({
      id: med.medicineId,
      name: med.name,
      unit: med.unit,
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
    const transformedPayload = {
      AppointmentId: payload.appointmentId,
      TestIds: payload.items, // ← Backend expects TestIds
      Note: payload.note,
      Priority: payload.priority,
    };
    await authHttp.post(`${PREFIX}/encounters/lab-orders`, transformedPayload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lưu chỉ định xét nghiệm"));
  }
}

/** Lưu toa thuốc */
export async function apiSubmitPrescription(payload: PrescriptionPayload) {
  try {
    const transformedPayload = {
      AppointmentId: payload.appointmentId,
      Lines: payload.lines.map((line) => ({
        MedicineId: line.drugId, 
        Dose: line.dose, 
        Frequency: line.frequency,
        Duration: line.duration,
        Note: line.note, 
      })),
      Advice: payload.advice, 
    };

    await authHttp.post(
      `${PREFIX}/encounters/prescriptions`,
      transformedPayload
    );
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
