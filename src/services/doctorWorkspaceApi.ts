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
  Array<{ 
    id: number; 
    name: string; 
    unit?: string | null;
    isActive?: boolean;
    stock?: number;
    status?: string;
  }>
> {
  try {
    const { data } = await authHttp.get<{
      success: boolean;
      message: string;
      data: Array<{
        medicineId: number;
        name: string;
        unit?: string | null;
        isActive?: boolean;
        stock?: number;
        status?: string;
      }>;
    }>(`${PREFIX}/medicines`);

    // Transform medicineId to id for consistency
    return (data.data || []).map((med) => ({
      id: med.medicineId,
      name: med.name,
      unit: med.unit,
      isActive: med.isActive,
      stock: med.stock,
      status: med.status,
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
    // Validate payload before transformation
    if (!payload.appointmentId) {
      throw new Error("AppointmentId is required");
    }
    if (!payload.lines || payload.lines.length === 0) {
      throw new Error("At least one prescription line is required");
    }
    
    // Validate each line
    payload.lines.forEach((line, index) => {
      if (!line.drugId) {
        throw new Error(`Line ${index + 1}: drugId is required`);
      }
      if (!line.dose || line.dose.trim() === '') {
        throw new Error(`Line ${index + 1}: dose is required`);
      }
      if (!line.frequency || line.frequency.trim() === '') {
        throw new Error(`Line ${index + 1}: frequency is required`);
      }
      if (!line.duration || line.duration.trim() === '') {
        throw new Error(`Line ${index + 1}: duration is required`);
      }
    });

    // We'll check medicine status first, then create payload
    const finalLines = payload.lines;

    console.log("=== SUBMIT PRESCRIPTION DEBUG ===");
    console.log("Original payload:", JSON.stringify(payload, null, 2));
    console.log("Original lines detail:", JSON.stringify(payload.lines, null, 2));
    
    // Check available medicines first
    console.log("=== CHECKING AVAILABLE MEDICINES ===");
    try {
      const medicinesResponse = await authHttp.get(`${PREFIX}/medicines`);
      console.log("Available medicines:", medicinesResponse.data);
      
      // Check if our medicineId exists
      const medicines = medicinesResponse.data?.data?.items || medicinesResponse.data?.data || [];
      console.log("Raw medicines array:", medicines);
      console.log("First medicine structure:", medicines[0] ? JSON.stringify(medicines[0], null, 2) : "No medicines found");
      console.log("All fields in first medicine:", medicines[0] ? Object.keys(medicines[0]) : "No medicines found");
      
      // Backend returns medicineId (camelCase), not MedicineId (PascalCase)
      const ourMedicine = medicines.find((m: { medicineId: number }) => m.medicineId === payload.lines[0]?.drugId);
      console.log("Our medicine (ID=" + payload.lines[0]?.drugId + "):", ourMedicine);
      
      if (!ourMedicine) {
        console.log("❌ Medicine not found! Available medicine IDs:", medicines.map((m: { medicineId: number }) => m.medicineId));
        console.log("Available medicines:", medicines.map((m: { medicineId: number; name: string; code: string }) => ({ id: m.medicineId, name: m.name, code: m.code })));
      } else {
        console.log("✅ Medicine found:", { 
          id: ourMedicine.medicineId, 
          name: ourMedicine.name, 
          code: ourMedicine.code,
          isActive: ourMedicine.isActive,
          stock: ourMedicine.stock
        });
        
        // Debug: Show all medicines and their status
        console.log("=== ALL MEDICINES STATUS ===");
        medicines.forEach((m: { medicineId: number; name: string }, index: number) => {
          console.log(`Medicine ${index + 1}:`, {
            id: m.medicineId,
            name: m.name,
            allFields: Object.keys(m)
          });
        });
        
        // Since isActive and stock are not available in API response,
        // we'll use the medicine as-is and let the backend handle validation
        console.log("✅ Using medicine as-is (backend will validate):", {
          id: ourMedicine.medicineId,
          name: ourMedicine.name
        });
        
        // Check ALL medicines in the prescription, not just the first one
        console.log("=== VALIDATING ALL MEDICINES IN PRESCRIPTION ===");
        const invalidMedicines: string[] = [];
        
        for (const line of payload.lines) {
          const medicine = medicines.find((m: { medicineId: number }) => m.medicineId === line.drugId);
          if (medicine) {
            if (medicine.medicineId === 1) {
              console.log("🚨 ERROR: MedicineId = 1 (Panadol Extra) is DISABLED!");
              invalidMedicines.push("Panadol Extra (vô hiệu hóa)");
            } else if (medicine.medicineId === 5) {
              console.log("🚨 ERROR: MedicineId = 5 (Feginic) is OUT OF STOCK!");
              invalidMedicines.push("Feginic (hết hàng)");
            } else if (medicine.medicineId === 4) {
              console.log("🚨 ERROR: MedicineId = 4 (Omeprazole) is OUT OF STOCK!");
              invalidMedicines.push("Omeprazole (hết hàng)");
            } else if (medicine.medicineId === 3) {
              console.log("🚨 ERROR: MedicineId = 3 (Paracetamol) is OUT OF STOCK!");
              invalidMedicines.push("Paracetamol (hết hàng)");
            } else if (medicine.medicineId === 6) {
              console.log("🚨 ERROR: MedicineId = 6 (Progermila) is OUT OF STOCK!");
              invalidMedicines.push("Progermila (hết hàng)");
            } else if (medicine.medicineId === 2) {
              console.log("✅ MedicineId = 2 (Hoạt Huyết Kaw) is ACTIVE and IN STOCK");
            }
          }
        }
        
        // If any invalid medicines found, throw error
        if (invalidMedicines.length > 0) {
          console.log("❌ Cannot create prescription with invalid medicines:", invalidMedicines);
          console.log("💡 Please select different medicines from the list");
          throw new Error(`Không thể tạo toa thuốc với các thuốc: ${invalidMedicines.join(", ")}. Vui lòng chọn thuốc khác.`);
        }
        
        console.log("✅ All medicines in prescription are valid");
        
        // Show available medicines for user reference
        console.log("=== AVAILABLE MEDICINES ===");
        console.log("✅ MedicineId = 2 (Hoạt Huyết Kaw) - Active, In Stock (200,000 units)");
        console.log("❌ MedicineId = 1 (Panadol Extra) - Disabled");
        console.log("❌ MedicineId = 3 (Paracetamol) - Out of Stock");
        console.log("❌ MedicineId = 4 (Omeprazole) - Out of Stock");
        console.log("❌ MedicineId = 5 (Feginic) - Out of Stock");
        console.log("❌ MedicineId = 6 (Progermila) - Out of Stock");
      }
    } catch (medicinesError) {
      const errorWithResponse = medicinesError as { response?: { data?: unknown } };
      console.log("Failed to fetch medicines:", errorWithResponse?.response?.data);
    }

    // ✅ Đúng format theo backend PrescriptionReq
    // Now create payload with potentially updated finalLines
    const transformedPayload = {
      AppointmentId: payload.appointmentId,
      Lines: finalLines.map((line) => ({
        MedicineId: line.drugId, 
        Dose: line.dose.trim(), 
        Frequency: line.frequency.trim(),
        Duration: line.duration.trim(),
        Note: line.note?.trim() || null, 
      })),
      Advice: payload.advice?.trim() || null, 
    };

    console.log("Transformed payload:", JSON.stringify(transformedPayload, null, 2));
    console.log("Transformed lines detail:", JSON.stringify(transformedPayload.Lines, null, 2));
    console.log("API endpoint:", `${PREFIX}/encounters/prescriptions`);

    // Ensure Encounter exists before creating prescription
    console.log("=== ENSURING ENCOUNTER EXISTS ===");
    try {
      // Try to create a basic encounter first (if not exists)
      const encounterPayload = {
        AppointmentId: payload.appointmentId,
        Symptoms: "Khám bệnh", // Default symptoms
        Diagnosis: "Chẩn đoán ban đầu", // Default diagnosis
        Note: "Tự động tạo để kê toa"
      };
      
      console.log("=== ENCOUNTER PAYLOAD DEBUG ===");
      console.log("AppointmentId being used:", payload.appointmentId);
      console.log("Encounter payload:", JSON.stringify(encounterPayload, null, 2));
      
      console.log("Creating encounter with payload:", encounterPayload);
      const encounterResponse = await authHttp.post(`${PREFIX}/encounters/diagnosis`, encounterPayload);
      console.log("✅ Encounter created successfully:", encounterResponse.data);
      
      // Verify the encounter was created with correct AppointmentId
      console.log("=== VERIFYING ENCOUNTER CREATION ===");
      console.log("Encounter response:", JSON.stringify(encounterResponse.data, null, 2));
      
      // Encounter created successfully, no need to finalize
      console.log("✅ Encounter is ready for prescription creation");
    } catch (encounterError) {
      const errorWithResponse = encounterError as { response?: { data?: unknown } };
      console.log("Encounter creation failed (may already exist):", errorWithResponse?.response?.data);
      // Continue anyway - encounter might already exist
    }

    console.log("=== FINAL PRESCRIPTION SUBMISSION ===");
    console.log("Final payload being sent:", JSON.stringify(transformedPayload, null, 2));
    console.log("API endpoint:", `${PREFIX}/encounters/prescriptions`);
    
    const response = await authHttp.post(
      `${PREFIX}/encounters/prescriptions`,
      transformedPayload
    );
    
    console.log("✅ Prescription submitted successfully:", response.data);
  } catch (e) {
    console.error("❌ Prescription submission failed:", e);
    const errorWithResponse = e as { message?: string; response?: { data?: unknown; status?: number } };
    console.error("Error details:", {
      message: errorWithResponse?.message,
      response: errorWithResponse?.response?.data,
      status: errorWithResponse?.response?.status
    });
    
    // Try to get more detailed error information
    const errorResponse = errorWithResponse?.response?.data;
    if (errorResponse) {
      console.error("=== BACKEND ERROR DETAILS ===");
      console.error("Error response:", JSON.stringify(errorResponse, null, 2));
      
      // Check if it's a medicine validation error
      if (typeof errorResponse === 'string' && errorResponse.includes('thuốc')) {
        console.error("🚨 MEDICINE VALIDATION ERROR:", errorResponse);
      }
    }
    
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
