import { useEffect, useMemo, useRef, useState } from "react";
import { Save, X, Plus, Trash, Upload, ImageIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";
import {
  apiGetAvailableUsers,
  apiUploadDoctorAvatar,
  apiDeleteDoctorAvatar,
  type AvailableUser,
  type CreateDoctorPayload,
  type DoctorItem,
  type UpdateDoctorPayload,
  type DoctorEducation,
  type DoctorExpertise,
  type DoctorAchievement,
} from "../../../services/doctorMApi";
import type { SpecialtyItem } from "../../../types/specialty/specialtyType";
import { apiGetPublicSpecialties } from "../../../services/specialtyApi";
import { getFullAvatarUrl, DEFAULT_AVATAR_URL } from "../../../Utils/avatarHelper";
import ConfirmModal from "../../../common/ConfirmModal";

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

  const [form, setForm] = useState<
    CreateDoctorPayload & UpdateDoctorPayload
  >({
    userId: initial?.userId ?? 0,
    title: initial?.title ?? null,
    primarySpecialtyId: null,
    licenseNo: initial?.licenseNo ?? null,
    roomName: initial?.roomName ?? null,
    experienceYears: initial?.experienceYears ?? null,
    experienceNote: null,
    intro: null,
    isActive: initial?.isActive ?? true,
    educations: [],
    expertises: [],
    achievements: [],
  });

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>(DEFAULT_AVATAR_URL);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [confirmDeleteAvatar, setConfirmDeleteAvatar] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null); // File tạm khi tạo mới
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States cho dynamic lists
  const [educations, setEducations] = useState<DoctorEducation[]>([]);
  const [expertises, setExpertises] = useState<DoctorExpertise[]>([]);
  const [achievements, setAchievements] = useState<DoctorAchievement[]>([]);

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
      educations: [],
      expertises: [],
      achievements: [],
    });
    setEducations([]);
    setExpertises([]);
    setAchievements([]);
    
    // Set avatar với full URL
    const initialAvatar = initial?.avatarUrl || "";
    setAvatarUrl(initialAvatar);
    setAvatarPreview(getFullAvatarUrl(initialAvatar));
    setPendingAvatarFile(null); // Reset pending file
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
  }, [open, initial?.doctorId, isEditing]); // Chỉ dùng doctorId thay vì toàn bộ initial object

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

  // =================== EDUCATION HANDLERS ===================
  const addEducation = () => {
    setEducations([
      ...educations,
      { yearFrom: null, yearTo: null, title: "", detail: null },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (
    index: number,
    field: keyof DoctorEducation,
    value: any
  ) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  // =================== EXPERTISE HANDLERS ===================
  const addExpertise = () => {
    setExpertises([...expertises, { content: "" }]);
  };

  const removeExpertise = (index: number) => {
    setExpertises(expertises.filter((_, i) => i !== index));
  };

  const updateExpertise = (index: number, value: string) => {
    const updated = [...expertises];
    updated[index] = { content: value };
    setExpertises(updated);
  };

  // =================== ACHIEVEMENT HANDLERS ===================
  const addAchievement = () => {
    setAchievements([...achievements, { yearLabel: null, content: "" }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievement = (
    index: number,
    field: keyof DoctorAchievement,
    value: any
  ) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  // =================== AVATAR UPLOAD HANDLERS ===================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (jpg, png, gif, webp)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Kiểm tra extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Chỉ chấp nhận: jpg, jpeg, png, gif, webp");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Nếu đang EDIT: Upload ngay lên server
    if (isEditing && initial?.doctorId) {
      setUploadingAvatar(true);
      try {
        const uploadedUrl = await apiUploadDoctorAvatar(initial.doctorId, file);
        
        // uploadedUrl từ backend là relative path như: /uploads/doctors/xxx.jpg
        setAvatarUrl(uploadedUrl);
        setAvatarPreview(getFullAvatarUrl(uploadedUrl)); // Convert sang full URL để hiển thị
        toast.success("Upload ảnh thành công!");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Không thể upload ảnh");
        
        // Reset preview về ảnh cũ
        setAvatarPreview(getFullAvatarUrl(initial?.avatarUrl));
      } finally {
        setUploadingAvatar(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      // Nếu đang TẠO MỚI: Lưu file tạm, upload sau khi tạo doctor
      setPendingAvatarFile(file);
      toast.success("Đã chọn ảnh. Ảnh sẽ được upload sau khi tạo hồ sơ.");
    }
  };

  const handleBrowseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAvatar = () => {
    // Nếu đang edit: Confirm và xóa từ server
    if (isEditing) {
      setConfirmDeleteAvatar(true);
    } else {
      // Nếu đang tạo mới: Chỉ xóa local
      setPendingAvatarFile(null);
      setAvatarUrl("");
      setAvatarPreview(DEFAULT_AVATAR_URL);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Đã xóa ảnh");
    }
  };

  const confirmDeleteAvatarAction = async () => {
    if (!isEditing || !initial?.doctorId) return;

    setConfirmDeleteAvatar(false);
    setUploadingAvatar(true);
    
    try {
      const fallbackUrl = await apiDeleteDoctorAvatar(initial.doctorId);
      
      setAvatarUrl("");
      setAvatarPreview(getFullAvatarUrl(fallbackUrl)); // Convert sang full URL
      toast.success("Đã xóa ảnh đại diện. Đang dùng ảnh profile.");
    } catch (error: any) {
      console.error("Delete avatar error:", error);
      toast.error(error.message || "Không thể xóa ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

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

    // Validate educations
    for (const edu of educations) {
      if (!edu.title?.trim()) {
        return setErr("Vui lòng nhập đầy đủ thông tin học vấn");
      }
    }

    // Validate expertises
    for (const exp of expertises) {
      if (!exp.content?.trim()) {
        return setErr("Vui lòng nhập đầy đủ thông tin chuyên môn");
      }
    }

    // Validate achievements
    for (const ach of achievements) {
      if (!ach.content?.trim()) {
        return setErr("Vui lòng nhập đầy đủ thông tin thành tựu");
      }
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
        educations: educations,
        expertises: expertises,
        achievements: achievements,
        ...(isEditing ? { isActive: form.isActive } : {}),
      };

      // Submit form chính
      await onSubmit(payload);
      
      // Nếu là tạo mới VÀ có file pending → Thông báo cần upload sau
      if (!isEditing && pendingAvatarFile) {
        // TODO: Backend cần trả về doctorId trong response của create endpoint
        // để có thể upload ảnh ngay sau khi tạo doctor
        
        // Hiện tại tạm thời thông báo user upload sau
        toast("Hồ sơ đã tạo thành công! Vui lòng vào 'Sửa' để upload ảnh đại diện.", {
          icon: "ℹ️",
          duration: 5000,
        });
      }
      
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
      <div className="relative w-full max-w-5xl mx-3 sm:mx-0 bg-white rounded-xl shadow-lg p-5 max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-6">
          {/* ============ THÔNG TIN CƠ BẢN ============ */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <h4 className="font-bold text-lg mb-4 text-sky-600">
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chọn User (chỉ hiện khi tạo mới) */}
              {!isEditing && (
                <>
                  {/* Avatar Section khi tạo mới */}
                  <div className="col-span-1 sm:col-span-2 p-4 bg-white rounded-md border">
                    <div className="flex items-start gap-4">
                      {/* Avatar Preview */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-28 h-28 rounded-full object-cover border-2 border-sky-200 shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.src.includes(DEFAULT_AVATAR_URL)) {
                                target.src = DEFAULT_AVATAR_URL;
                              }
                            }}
                          />
                          {uploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Upload Buttons */}
                        <div className="flex flex-col gap-1 w-full">
                          <button
                            type="button"
                            onClick={handleBrowseFile}
                            disabled={uploadingAvatar}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary-linear text-white rounded-[var(--rounded)] cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-3 h-3" />
                            Chọn ảnh
                          </button>
                          {pendingAvatarFile && (
                            <button
                              type="button"
                              onClick={handleDeleteAvatar}
                              disabled={uploadingAvatar}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-error-linear text-white rounded-[var(--rounded)] cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa ảnh
                            </button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <p className="text-[10px] text-slate-400 text-center">
                            jpg, png, gif, webp
                          </p>
                          <p className="text-[10px] text-slate-400 text-center">
                            Max 5MB
                          </p>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
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
                        <p className="text-xs text-slate-400 mt-2">
                          💡 <strong>Lưu ý:</strong> Ảnh sẽ được lưu sau khi tạo hồ sơ thành công. 
                          Nếu cần thay đổi ảnh, vui lòng vào "Sửa" sau khi tạo.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Hiển thị thông tin User khi edit */}
              {isEditing && initial && (
                <div className="col-span-1 sm:col-span-2 p-4 bg-white rounded-md border">
                  <div className="flex items-start gap-4">
                    {/* Avatar Preview & Upload */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt={initial.fullName}
                          className="w-28 h-28 rounded-full object-cover border-2 border-sky-200 shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Chỉ set default nếu chưa phải là default (tránh infinite loop)
                            if (!target.src.includes(DEFAULT_AVATAR_URL)) {
                              target.src = DEFAULT_AVATAR_URL;
                            }
                          }}
                        />
                        {uploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Buttons */}
                      <div className="flex flex-col gap-1 w-full">
                        <button
                          type="button"
                          onClick={handleBrowseFile}
                          disabled={uploadingAvatar}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary-linear text-white rounded-[var(--rounded)] cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          {uploadingAvatar ? "Đang tải..." : "Upload ảnh"}
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
                            disabled={uploadingAvatar}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-error-linear text-white rounded-[var(--rounded)] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Xóa ảnh
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <p className="text-[10px] text-slate-400 text-center">
                          jpg, png, gif, webp
                        </p>
                        <p className="text-[10px] text-slate-400 text-center">
                          Max 5MB
                        </p>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-1">
                        <strong>Bác sĩ:</strong> {initial.fullName}
                      </p>
                      <p className="text-sm text-slate-600 mb-1">
                        <strong>Email:</strong> {initial.email || "-"}
                      </p>
                      <p className="text-sm text-slate-600 mb-3">
                        <strong>SĐT:</strong> {initial.phone || "-"}
                      </p>
                      
                      {/* Manual URL Input */}
                      <div>
                        <label className="text-xs text-slate-600 block mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          URL Ảnh đại diện (tùy chọn)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={avatarUrl}
                            readOnly
                            placeholder="Chưa có ảnh đại diện"
                            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-slate-50 text-slate-600"
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          URL ảnh hiện tại (upload file để thay đổi)
                        </p>
                      </div>
                    </div>
                  </div>
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
                  onChange={(e) =>
                    setForm({ ...form, licenseNo: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, roomName: e.target.value })
                  }
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
            </div>
          </div>

          {/* ============ HỌC VẤN ============ */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-sky-600">
                Học vấn ({educations.length})
              </h4>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 px-3 py-2 bg-primary-linear text-white rounded-[var(--rounded)] cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>
            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border relative">
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="number"
                      placeholder="Năm bắt đầu"
                      value={edu.yearFrom ?? ""}
                      onChange={(e) =>
                        updateEducation(
                          idx,
                          "yearFrom",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="col-span-1 px-3 py-2 border rounded-lg text-sm"
                      min={1950}
                      max={2100}
                    />
                    <input
                      type="number"
                      placeholder="Năm kết thúc"
                      value={edu.yearTo ?? ""}
                      onChange={(e) =>
                        updateEducation(
                          idx,
                          "yearTo",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="col-span-1 px-3 py-2 border rounded-lg text-sm"
                      min={1950}
                      max={2100}
                    />
                    <input
                      type="text"
                      placeholder="Học hàm/Học vị *"
                      value={edu.title}
                      onChange={(e) =>
                        updateEducation(idx, "title", e.target.value)
                      }
                      className="col-span-2 px-3 py-2 border rounded-lg text-sm"
                      required
                    />
                    <textarea
                      placeholder="Chi tiết (VD: Đại học Y Hà Nội)"
                      value={edu.detail ?? ""}
                      onChange={(e) =>
                        updateEducation(idx, "detail", e.target.value || null)
                      }
                      className="col-span-4 px-3 py-2 border rounded-lg text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {educations.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Chưa có học vấn nào. Nhấn "Thêm" để thêm mới.
                </p>
              )}
            </div>
          </div>

          {/* ============ CHUYÊN MÔN ============ */}
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-green-700">
                Chuyên môn ({expertises.length})
              </h4>
              <button
                type="button"
                onClick={addExpertise}
                className="inline-flex items-center gap-1 px-3 py-2 bg-success-linear text-white rounded-[var(--rounded)] cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>
            <div className="space-y-2">
              {expertises.map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Nội dung chuyên môn *"
                    value={exp.content}
                    onChange={(e) => updateExpertise(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeExpertise(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {expertises.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Chưa có chuyên môn nào. Nhấn "Thêm" để thêm mới.
                </p>
              )}
            </div>
          </div>

          {/* ============ THÀNH TỰU ============ */}
          <div className="border rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-yellow-700">
                Thành tựu ({achievements.length})
              </h4>
              <button
                type="button"
                onClick={addAchievement}
                className="inline-flex items-center gap-1 px-3 py-2 bg-maintenance-linear text-white rounded-[var(--rounded)] cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>
            <div className="space-y-3">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border relative"
                >
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Nhãn năm (VD: 2020)"
                      value={ach.yearLabel ?? ""}
                      onChange={(e) =>
                        updateAchievement(
                          idx,
                          "yearLabel",
                          e.target.value || null
                        )
                      }
                      className="col-span-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Nội dung thành tựu *"
                      value={ach.content}
                      onChange={(e) =>
                        updateAchievement(idx, "content", e.target.value)
                      }
                      className="col-span-3 px-3 py-2 border rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Chưa có thành tựu nào. Nhấn "Thêm" để thêm mới.
                </p>
              )}
            </div>
          </div>
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

      {/* Confirm Delete Avatar Modal */}
      <ConfirmModal
        open={confirmDeleteAvatar}
        onClose={() => setConfirmDeleteAvatar(false)}
        onConfirm={confirmDeleteAvatarAction}
        loading={uploadingAvatar}
        title="Xóa ảnh đại diện"
        description="Bạn có chắc muốn xóa ảnh đại diện này? Ảnh sẽ trở về ảnh profile mặc định."
        confirmText="Xóa ảnh"
        cancelText="Hủy"
        danger
      />
    </div>
  );
}
