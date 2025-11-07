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

  if (form.avatarUrl && form.avatarUrl !== initial.avatarUrl) {
    const url = form.avatarUrl.trim();
    if (isHttpUrl(url)) p.avatarUrl = url;
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
