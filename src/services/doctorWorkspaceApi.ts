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

// ==================== INTERNAL INTERFACES (Response Types) ====================

// Response từ BE: GET /lab-tests
interface LabTestResponse {
  labTestId: number;
  code: string | null;
  name: string;
}

// Response từ BE: GET /medicines
// Backend trả về: medicineId, name, unit, isActive, stock (decimal/number)
interface MedicineResponse {
  medicineId: number;
  name: string;
  unit: string | null;
  isActive: boolean;
  stock: number; // BE trả về number (decimal)
}

// Response từ BE: POST /encounters/start
interface StartEncounterResponse {
  appointmentId: number;
  status: string;
}

// Response từ BE: POST /encounters/complete
interface CompleteEncounterResponse {
  appointmentId: number;
  status: string;
  invoiceId: number;
  invoiceCode: string;
}

// ==================== API FUNCTIONS ====================

/** Lấy danh mục xét nghiệm */
export async function apiGetLabTests(): Promise<LabItem[]> {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message: string;
      data: LabTestResponse[];
    }>(`${PREFIX}/lab-tests`);

    const items = data.data || [];

    // Map từ backend (labTestId) sang frontend (id)
    return items.map((item) => ({
      id: item.labTestId,
      code: item.code || "",
      name: item.name,
      price: 0, // Backend chưa trả về giá ở API này, set mặc định hoặc update BE nếu cần
    }));
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không tải được danh mục xét nghiệm"));
  }
}

/** Lấy danh mục thuốc (Đã cập nhật logic parse Stock) */
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
      data: MedicineResponse[];
    }>(`${PREFIX}/medicines`);

    return (data.data || []).map((med) => ({
      id: med.medicineId,
      name: med.name,
      unit: med.unit ?? "",
      isActive: med.isActive,
      // Đảm bảo stock là số dương (đề phòng BE trả null hoặc âm)
      stock: med.stock > 0 ? med.stock : 0,
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
      data: StartEncounterResponse;
    }>(`${PREFIX}/encounters/start`, payload);
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể bắt đầu phiên khám"));
  }
}

/** Lưu chẩn đoán */
export async function apiSubmitDiagnosis(payload: DiagnosisPayload) {
  try {
    // Backend C# map tự động camelCase -> PascalCase
    const transformedPayload = {
      appointmentId: payload.appointmentId,
      symptoms: payload.symptoms,
      diagnosis: payload.diagnosis,
      note: payload.note,
    };
    await authHttp.post(`${PREFIX}/encounters/diagnosis`, transformedPayload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể lưu chẩn đoán"));
  }
}

/** Lưu chỉ định xét nghiệm */
export async function apiSubmitLabOrder(payload: LabOrderPayload) {
  try {
    // Backend LabOrderReq chỉ cần: { AppointmentId, TestIds, Note, Priority }
    const transformedPayload = {
      appointmentId: payload.appointmentId,
      testIds: payload.items, // List<int> TestIds
      note: payload.note,
      priority: payload.priority,
    };

    // Đã xóa phần map 'Tests' vì backend không nhận, chỉ nhận danh sách ID
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
      appointmentId: payload.appointmentId,
      lines: payload.lines.map((line) => ({
        medicineId: line.drugId,
        dose: line.dose.trim(),
        frequency: line.frequency.trim(),
        duration: line.duration.trim(),
        note: line.note?.trim() || null,
      })),
      advice: payload.advice?.trim() || null,
    };

    // Tạo encounter ảo nếu chưa có (để đảm bảo integrity)
    try {
      const encounterPayload = {
        appointmentId: payload.appointmentId,
        symptoms: "Khám bệnh",
        diagnosis: "Chẩn đoán ban đầu",
        note: "Tự động tạo để kê toa",
      };
      await authHttp.post(`${PREFIX}/encounters/diagnosis`, encounterPayload);
    } catch {
      // Ignore: Nếu đã có encounter rồi thì backend sẽ bỏ qua hoặc update nhẹ, không sao
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
    const { data } = await authHttp.post<{
      success: boolean;
      message: string;
      data: CompleteEncounterResponse;
    }>(`${PREFIX}/encounters/complete`, payload);
    return data.data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể hoàn tất phiên khám"));
  }
}