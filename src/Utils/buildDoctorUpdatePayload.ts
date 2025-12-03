import type { UpdateDoctorPayload } from "../types/doctor/doctor";

const isHttpUrl = (u: string) => /^https?:\/\//i.test(u);

export function buildDoctorUpdatePayload(
  form: UpdateDoctorPayload,
  initial: UpdateDoctorPayload
): Partial<UpdateDoctorPayload> {
  const p: Partial<UpdateDoctorPayload> = {};
  const trimOrNull = (v?: string | null) =>
    v === undefined ? undefined : v?.trim() || null;

  if (form.title !== initial.title) p.title = trimOrNull(form.title);
  if (form.primarySpecialtyId !== initial.primarySpecialtyId)
    p.primarySpecialtyId = form.primarySpecialtyId ?? null;
  if (form.licenseNo !== initial.licenseNo)
    p.licenseNo = trimOrNull(form.licenseNo);
  if (form.roomName !== initial.roomName)
    p.roomName = trimOrNull(form.roomName);
  if (form.experienceYears !== initial.experienceYears)
    p.experienceYears = form.experienceYears;
  if (form.experienceNote !== initial.experienceNote)
    p.experienceNote = trimOrNull(form.experienceNote);
  if (form.intro !== initial.intro) p.intro = trimOrNull(form.intro);
  if (form.isActive !== initial.isActive) p.isActive = form.isActive;

  // Xử lý avatarUrl: nếu modal đã gửi avatarUrl (có trong payload), luôn gửi
  // Modal đã so sánh với giá trị ban đầu từ detail, nên không cần so sánh lại ở đây
  // Backend: null = không đổi, "" = xóa, "url" = cập nhật
  if (form.avatarUrl !== undefined) {
    const formAvatar = form.avatarUrl?.trim() || "";
    // Nếu formAvatar là empty string, gửi "" để backend xóa
    // Nếu formAvatar là URL hợp lệ, gửi URL
    if (formAvatar === "") {
      p.avatarUrl = ""; // Gửi empty string để xóa
    } else if (isHttpUrl(formAvatar)) {
      p.avatarUrl = formAvatar; // Gửi URL để cập nhật
    }
    // Nếu không phải empty string và không phải URL hợp lệ, không gửi (có thể là giá trị không hợp lệ)
  }

  const changed = (a?: unknown[], b?: unknown[]) =>
    JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);

  if (changed(form.educations, initial.educations))
    p.educations = form.educations;
  if (changed(form.expertises, initial.expertises))
    p.expertises = form.expertises;
  if (changed(form.achievements, initial.achievements))
    p.achievements = form.achievements;

  return p;
}
