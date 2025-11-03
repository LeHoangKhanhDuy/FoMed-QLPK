// src/utils/normalizeLabStatus.ts
export type LabStatus =
  | "pending"
  | "processing"
  | "completed"
  | "abnormal"
  | "canceled";

export function normalizeLabStatus(s?: string | null): LabStatus {
  const x = (s ?? "").toLowerCase().trim();
  switch (x) {
    case "completed":
    case "normal":
    case "done":
      return "completed";
    case "processing":
      return "processing";
    case "abnormal":
      return "abnormal";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "pending":
    case "waiting":
    default:
      return "pending";
  }
}
