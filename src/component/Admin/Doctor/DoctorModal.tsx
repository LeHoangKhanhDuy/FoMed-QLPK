import { useEffect, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";
import { apiGetAvailableUsers, type AvailableUser, type CreateDoctorPayload, type DoctorItem, type UpdateDoctorPayload } from "../../../services/doctorMApi";
import type { SpecialtyItem } from "../../../types/specialty/specialtyType";
import { apiGetPublicSpecialties } from "../../../services/specialtyApi";

// ===================== PROPS =====================
type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DoctorItem>;
  onSubmit: (
    payload: CreateDoctorPayload | UpdateDoctorPayload
  ) => Promise<void>;
};

// ===================== COMPONENT =====================
export default function DoctorModal({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const isEditing = !!initial?.doctorId;

  const [form, setForm] = useState<CreateDoctorPayload & UpdateDoctorPayload>({
    userId: initial?.userId ?? 0,
    title: initial?.title ?? null,
    primarySpecialtyId: null,
    licenseNo: initial?.licenseNo ?? null,
    roomName: initial?.roomName ?? null,
    experienceYears: initial?.experienceYears ?? null,
    experienceNote: null,
    intro: null,
    isActive: initial?.isActive ?? true,
  });

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Danh sách Users
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Danh sách Specialties
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Reset form
    setForm({
      userId: initial?.userId ?? 0,
      title: initial?.title ?? null,
      primarySpecialtyId: null,
      licenseNo: initial?.licenseNo ?? null,
      roomName: initial?.roomName ?? null,
      experienceYears: initial?.experienceYears ?? null,
      experienceNote: null,
      intro: null,
      isActive: initial?.isActive ?? true,
    });
    setErr(null);

    // Load Available Users (chỉ khi tạo mới)
    if (!isEditing) {
      setLoadingUsers(true);
      apiGetAvailableUsers()
        .then(setAvailableUsers)
        .catch(() => setAvailableUsers([]))
        .finally(() => setLoadingUsers(false));
    }

    // Load Specialties từ API mới
    setLoadingSpecialties(true);
    apiGetPublicSpecialties()
      .then(setSpecialties)
      .catch(() => setSpecialties([]))
      .finally(() => setLoadingSpecialties(false));
  }, [open, initial, isEditing]);

  const ctrl =
    "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500";

  // Options cho User Select
  const userOptions: SelectOption<number>[] = useMemo(
    () =>
      availableUsers.map((u) => ({
        value: u.userId,
        label: `${u.fullName} (${u.email || u.phone || "No contact"})`,
      })),
    [availableUsers]
  );

  // Options cho Specialty Select
  const specialtyOptions: SelectOption<number>[] = useMemo(
    () =>
      specialties.map((s) => ({
        value: s.specialtyId,
        label: s.name,
      })),
    [specialties]
  );

  const submit = async () => {
    // Validate
    if (!isEditing && (!form.userId || form.userId <= 0)) {
      return setErr("Vui lòng chọn User");
    }

    if (form.title && form.title.trim().length > 50) {
      return setErr("Học hàm không được vượt quá 50 ký tự");
    }

    if (form.licenseNo && form.licenseNo.trim().length > 50) {
      return setErr("Số chứng chỉ hành nghề không được vượt quá 50 ký tự");
    }

    if (form.roomName && form.roomName.trim().length > 100) {
      return setErr("Tên phòng khám không được vượt quá 100 ký tự");
    }

    if (form.experienceNote && form.experienceNote.trim().length > 500) {
      return setErr("Ghi chú kinh nghiệm không được vượt quá 500 ký tự");
    }

    if (form.intro && form.intro.trim().length > 2000) {
      return setErr("Giới thiệu không được vượt quá 2000 ký tự");
    }

    setLoading(true);
    try {
      const payload: CreateDoctorPayload | UpdateDoctorPayload = {
        ...(isEditing ? {} : { userId: form.userId }),
        title: form.title?.trim() || null,
        primarySpecialtyId: form.primarySpecialtyId || null,
        licenseNo: form.licenseNo?.trim() || null,
        roomName: form.roomName?.trim() || null,
        experienceYears: form.experienceYears,
        experienceNote: form.experienceNote?.trim() || null,
        intro: form.intro?.trim() || null,
        ...(isEditing ? { isActive: form.isActive } : {}),
      };

      await onSubmit(payload);
      onClose();
    } catch (e) {
      const error = e as Error;
      setErr(error.message || "Không lưu được hồ sơ bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-xl uppercase flex-1 text-center">
            {isEditing ? "Sửa hồ sơ bác sĩ" : "Thêm bác sĩ mới"}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-rose-600">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Chọn User (chỉ hiện khi tạo mới) */}
          {!isEditing && (
            <div className="col-span-1 sm:col-span-2">
              <SelectMenu<number>
                label="Chọn User"
                required
                value={form.userId || ""}
                options={userOptions}
                placeholder={
                  loadingUsers ? "Đang tải..." : "Chọn User có role DOCTOR"
                }
                onChange={(v) =>
                  setForm({ ...form, userId: v === "" ? 0 : Number(v) })
                }
              />
            </div>
          )}

          {/* Hiển thị thông tin User khi edit */}
          {isEditing && initial && (
            <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-md">
              <p className="text-sm text-slate-600">
                <strong>Bác sĩ:</strong> {initial.fullName}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Email:</strong> {initial.email || "-"}
              </p>
              <p className="text-sm text-slate-600">
                <strong>SĐT:</strong> {initial.phone || "-"}
              </p>
            </div>
          )}

          {/* Học hàm */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Học hàm</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.title ?? ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={ctrl}
              placeholder="VD: BS, TS.BS, PGS.TS..."
              maxLength={50}
            />
          </label>

          {/* Số chứng chỉ hành nghề */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">
                Số chứng chỉ hành nghề
              </span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.licenseNo ?? ""}
              onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
              className={ctrl}
              placeholder="VD: 12345/BYT"
              maxLength={50}
            />
          </label>

          {/* Chuyên khoa chính */}
          <SelectMenu<number>
            label="Chuyên khoa chính"
            required
            value={form.primarySpecialtyId ?? ""}
            options={specialtyOptions}
            placeholder={
              loadingSpecialties ? "Đang tải..." : "Chọn chuyên khoa"
            }
            onChange={(v) =>
              setForm({
                ...form,
                primarySpecialtyId: v === "" ? null : Number(v),
              })
            }
            className="col-span-1"
          />

          {/* Phòng khám */}
          <label className="text-sm">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">Phòng khám</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.roomName ?? ""}
              onChange={(e) => setForm({ ...form, roomName: e.target.value })}
              className={ctrl}
              placeholder="VD: P101, P202..."
              maxLength={100}
            />
          </label>

          {/* Số năm kinh nghiệm */}
          <label className="text-sm col-span-1 sm:col-span-2">
            <div className="flex items-center gap-1">
              <span className="block mb-1 text-slate-600">
                Số năm kinh nghiệm
              </span>
              <span className="text-red-500">*</span>
            </div>
            <input
              type="number"
              min={0}
              max={100}
              value={form.experienceYears ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  experienceYears:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={ctrl}
              placeholder="VD: 5"
            />
          </label>

          {/* Ghi chú kinh nghiệm */}
          <label className="text-sm col-span-1 sm:col-span-2">
            <span className="block mb-1 text-slate-600">
              Ghi chú kinh nghiệm
            </span>
            <textarea
              value={form.experienceNote ?? ""}
              onChange={(e) =>
                setForm({ ...form, experienceNote: e.target.value })
              }
              className={ctrl}
              rows={3}
              placeholder="Mô tả ngắn về kinh nghiệm làm việc..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">
              {form.experienceNote?.length || 0}/500 ký tự
            </p>
          </label>

          {/* Giới thiệu */}
          <label className="text-sm col-span-1 sm:col-span-2">
            <span className="block mb-1 text-slate-600">Giới thiệu</span>
            <textarea
              value={form.intro ?? ""}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              className={ctrl}
              rows={5}
              placeholder="Giới thiệu chi tiết về bác sĩ..."
              maxLength={2000}
            />
            <p className="text-xs text-slate-400 mt-1">
              {form.intro?.length || 0}/2000 ký tự
            </p>
          </label>

          {/* Trạng thái (chỉ hiện khi edit) */}
          {/* {isEditing && (
            <label className="text-sm flex items-center gap-2 col-span-1 sm:col-span-2">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="cursor-pointer h-4 w-4"
              />
              <span>Đang hoạt động</span>
            </label>
          )} */}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] border hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="cursor-pointer px-4 py-2 rounded-[var(--rounded)] bg-primary-linear text-white inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
